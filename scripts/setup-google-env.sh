#!/bin/bash

# Script para configurar variáveis do Google Cloud na Vercel automaticamente

echo "🚀 Configuração automática do Google Cloud para Vercel"
echo "=================================================="

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar dependências
if ! command_exists vercel; then
    echo -e "${RED}❌ Vercel CLI não encontrado. Instale com: npm i -g vercel${NC}"
    exit 1
fi

if ! command_exists gcloud; then
    echo -e "${RED}❌ Google Cloud SDK não encontrado. Instale em: https://cloud.google.com/sdk${NC}"
    exit 1
fi

# Definir projeto do Google Cloud
echo -e "${YELLOW}📋 Configurando projeto Google Cloud...${NC}"
PROJECT_ID="exzosverce"

# Configurar projeto no gcloud
gcloud config set project $PROJECT_ID 2>/dev/null

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao configurar projeto. Verifique se o projeto 'exzosverce' existe${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Projeto: $PROJECT_ID${NC}"

# Criar service account se não existir
SERVICE_ACCOUNT_NAME="exzosnexus-mcp"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo -e "${YELLOW}🔐 Configurando Service Account...${NC}"

# Verificar se service account existe
if ! gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL >/dev/null 2>&1; then
    echo "Criando service account..."
    gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
        --display-name="ExzosNexus MCP Service Account" \
        --description="Service account for ExzosNexus MCP Hub"
fi

# Adicionar roles necessárias
echo -e "${YELLOW}🔑 Configurando permissões...${NC}"

ROLES=(
    "roles/aiplatform.user"
    "roles/storage.objectViewer"
    "roles/cloudtranslate.user"
    "roles/cloudfunctions.invoker"
)

for role in "${ROLES[@]}"; do
    echo "Adicionando role: $role"
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
        --role="$role" \
        --quiet >/dev/null 2>&1
done

# Habilitar APIs necessárias
echo -e "${YELLOW}🔌 Habilitando APIs do Google Cloud...${NC}"

APIS=(
    "aiplatform.googleapis.com"
    "generativelanguage.googleapis.com"
    "drive.googleapis.com"
    "calendar-json.googleapis.com"
    "gmail.googleapis.com"
    "sheets.googleapis.com"
    "maps.googleapis.com"
    "youtube.googleapis.com"
)

for api in "${APIS[@]}"; do
    echo "Habilitando: $api"
    gcloud services enable $api --quiet
done

# Criar chave JSON para service account
KEY_FILE="./google-credentials.json"
echo -e "${YELLOW}🔐 Gerando credenciais...${NC}"

if [ ! -f "$KEY_FILE" ]; then
    gcloud iam service-accounts keys create $KEY_FILE \
        --iam-account=$SERVICE_ACCOUNT_EMAIL \
        --quiet
fi

# Criar API Key para Gemini
echo -e "${YELLOW}🔑 Criando API Key para Google AI...${NC}"

# Nota: API Keys precisam ser criadas manualmente no Console
echo -e "${YELLOW}⚠️  API Keys precisam ser criadas manualmente:${NC}"
echo "1. Acesse: https://console.cloud.google.com/apis/credentials"
echo "2. Clique em 'Criar credenciais' > 'Chave de API'"
echo "3. Restrinja por APIs: Generative Language API"
echo ""
read -p "Digite sua Google AI API Key: " GOOGLE_AI_API_KEY

# Criar arquivo .env.local
echo -e "${YELLOW}📝 Criando arquivo .env.local...${NC}"

cat > .env.local << EOF
# Google Cloud Platform
GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID
GOOGLE_CLOUD_REGION=us-central1

# Vertex AI
VERTEX_AI_LOCATION=us-central1

# Google AI (Gemini)
GOOGLE_AI_API_KEY=$GOOGLE_AI_API_KEY
GOOGLE_GENERATIVE_AI_API_KEY=$GOOGLE_AI_API_KEY

# Service Account (será convertido para base64)
# GOOGLE_CREDENTIALS_BASE64 será adicionado automaticamente
EOF

# Converter credenciais para base64
CREDENTIALS_BASE64=$(base64 -i $KEY_FILE | tr -d '\n')

# Configurar variáveis na Vercel
echo -e "${YELLOW}🚀 Configurando variáveis na Vercel...${NC}"

# Login na Vercel se necessário
vercel whoami >/dev/null 2>&1 || vercel login

# Adicionar variáveis
echo "Adicionando variáveis de ambiente..."

vercel env add GOOGLE_CLOUD_PROJECT_ID production < <(echo $PROJECT_ID)
vercel env add GOOGLE_CLOUD_REGION production < <(echo "us-central1")
vercel env add VERTEX_AI_LOCATION production < <(echo "us-central1")
vercel env add GOOGLE_AI_API_KEY production < <(echo $GOOGLE_AI_API_KEY)
vercel env add GOOGLE_GENERATIVE_AI_API_KEY production < <(echo $GOOGLE_AI_API_KEY)
vercel env add GOOGLE_CREDENTIALS_BASE64 production < <(echo $CREDENTIALS_BASE64)

# Criar helper para decodificar credenciais
echo -e "${YELLOW}📝 Criando helper para credenciais...${NC}"

cat > lib/google-credentials.ts << 'EOF'
import fs from 'fs';
import path from 'path';

let credentials: any = null;

export function getGoogleCredentials() {
  if (credentials) return credentials;

  // Em produção, usar base64
  if (process.env.GOOGLE_CREDENTIALS_BASE64) {
    const decoded = Buffer.from(
      process.env.GOOGLE_CREDENTIALS_BASE64, 
      'base64'
    ).toString('utf-8');
    
    credentials = JSON.parse(decoded);
    
    // Salvar temporariamente para SDKs que precisam de arquivo
    const tempPath = '/tmp/google-credentials.json';
    fs.writeFileSync(tempPath, decoded);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = tempPath;
    
    return credentials;
  }

  // Em desenvolvimento, usar arquivo local
  if (process.env.NODE_ENV === 'development') {
    const localPath = path.join(process.cwd(), 'google-credentials.json');
    if (fs.existsSync(localPath)) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = localPath;
      credentials = JSON.parse(fs.readFileSync(localPath, 'utf-8'));
      return credentials;
    }
  }

  throw new Error('Google credentials not found');
}
EOF

# Adicionar ao .gitignore
echo -e "${YELLOW}🔒 Atualizando .gitignore...${NC}"

cat >> .gitignore << EOF

# Google Cloud
google-credentials.json
.env.local
EOF

# Criar exemplo de uso
echo -e "${YELLOW}📝 Criando exemplo de uso...${NC}"

cat > app/api/test-google/route.ts << 'EOF'
import { NextResponse } from 'next/server';
import { getGoogleCredentials } from '@/lib/google-credentials';
import { VertexAI } from '@google-cloud/vertexai';

export async function GET() {
  try {
    // Configurar credenciais
    const creds = getGoogleCredentials();
    
    // Testar Vertex AI
    const vertexAI = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT_ID!,
      location: process.env.VERTEX_AI_LOCATION!,
    });
    
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
    });
    
    const result = await model.generateContent('Olá! Teste do ExzosNexus.');
    
    return NextResponse.json({
      success: true,
      project: process.env.GOOGLE_CLOUD_PROJECT_ID,
      response: result.response.text()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
EOF

echo -e "${GREEN}✅ Configuração concluída!${NC}"
echo ""
echo "Próximos passos:"
echo "1. Deploy na Vercel: vercel --prod"
echo "2. Teste: https://seu-projeto.vercel.app/api/test-google"
echo ""
echo -e "${YELLOW}⚠️  Lembre-se de:${NC}"
echo "- Nunca commitar google-credentials.json"
echo "- Configurar OAuth 2.0 para Google Workspace APIs"
echo "- Monitorar uso e custos no Google Cloud Console"