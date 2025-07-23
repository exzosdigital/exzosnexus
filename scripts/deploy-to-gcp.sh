#!/bin/bash

# Script para deploy dos MCPs no Google Cloud Platform
# Projeto: exzosverce

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🚀 Deploy do ExzosNexus MCP Hub no Google Cloud"
echo "=============================================="

# Configuração do projeto
PROJECT_ID="exzosverce"
REGION="us-central1"
SERVICE_NAME="exzosnexus-mcp"

echo -e "${YELLOW}📋 Projeto: $PROJECT_ID${NC}"
echo -e "${YELLOW}📍 Região: $REGION${NC}"

# Verificar se está logado no gcloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo -e "${RED}❌ Você não está autenticado no gcloud${NC}"
    echo "Execute: gcloud auth login"
    exit 1
fi

# Configurar projeto
echo -e "${YELLOW}🔧 Configurando projeto...${NC}"
gcloud config set project $PROJECT_ID

# Habilitar APIs necessárias
echo -e "${YELLOW}🔌 Habilitando APIs...${NC}"

APIS=(
    "run.googleapis.com"
    "cloudbuild.googleapis.com"
    "artifactregistry.googleapis.com"
    "aiplatform.googleapis.com"
    "generativelanguage.googleapis.com"
)

for api in "${APIS[@]}"; do
    echo "Habilitando: $api"
    gcloud services enable $api --quiet
done

# Criar Artifact Registry se não existir
echo -e "${YELLOW}📦 Configurando Artifact Registry...${NC}"

REPO_NAME="mcp-services"
if ! gcloud artifacts repositories describe $REPO_NAME --location=$REGION &> /dev/null; then
    echo "Criando repositório..."
    gcloud artifacts repositories create $REPO_NAME \
        --repository-format=docker \
        --location=$REGION \
        --description="MCPs do ExzosNexus"
fi

# Build da imagem
echo -e "${YELLOW}🔨 Fazendo build da imagem Docker...${NC}"

# Criar Dockerfile se não existir
if [ ! -f "Dockerfile" ]; then
    cat > Dockerfile << 'EOF'
FROM node:20-alpine

# Instalar dependências do sistema
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY pnpm-lock.yaml* ./
COPY yarn.lock* ./

# Instalar dependências
RUN if [ -f pnpm-lock.yaml ]; then \
        npm install -g pnpm && pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then \
        yarn install --frozen-lockfile; \
    else \
        npm ci; \
    fi

# Copiar código
COPY . .

# Build
RUN npm run build

# Configurar porta
ENV PORT=8080
EXPOSE 8080

# Iniciar aplicação
CMD ["npm", "start"]
EOF
fi

# Fazer build e push
IMAGE_URL="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}"
echo -e "${YELLOW}🐳 Imagem: $IMAGE_URL${NC}"

gcloud builds submit --tag $IMAGE_URL

# Deploy no Cloud Run
echo -e "${YELLOW}☁️  Deploy no Cloud Run...${NC}"

gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_URL \
    --platform managed \
    --region $REGION \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300 \
    --concurrency 1000 \
    --max-instances 10 \
    --min-instances 0 \
    --allow-unauthenticated \
    --set-env-vars "GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID" \
    --set-env-vars "NODE_ENV=production"

# Obter URL do serviço
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --format 'value(status.url)')

echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo -e "${GREEN}🌐 URL: $SERVICE_URL${NC}"

# Criar arquivo de configuração para Cloud Scheduler (opcional)
echo -e "${YELLOW}📅 Criando configuração para tarefas agendadas...${NC}"

cat > cloud-scheduler.sh << EOF
#!/bin/bash
# Criar job para manutenção diária

gcloud scheduler jobs create http mcp-daily-maintenance \
    --location=$REGION \
    --schedule="0 2 * * *" \
    --uri="${SERVICE_URL}/api/cron/mcp-maintenance" \
    --http-method=GET \
    --headers="authorization=Bearer \${CRON_SECRET}"
EOF

chmod +x cloud-scheduler.sh

echo -e "${YELLOW}💡 Dicas:${NC}"
echo "1. Configure as variáveis de ambiente no Cloud Run Console"
echo "2. Para logs: gcloud run services logs read $SERVICE_NAME"
echo "3. Para métricas: visite o Cloud Console"
echo "4. Execute ./cloud-scheduler.sh para configurar cron jobs"