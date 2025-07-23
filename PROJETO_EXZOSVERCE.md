# Projeto ExzosVerce - Configuração Google Cloud

## Informações do Projeto

- **Project ID**: `exzosverce`
- **Project Name**: ExzosVerce
- **Region**: `us-central1`
- **Zone**: `us-central1-a`

## APIs Habilitadas

### AI/ML
- ✅ Vertex AI API (`aiplatform.googleapis.com`)
- ✅ Generative Language API (`generativelanguage.googleapis.com`)

### Google Workspace
- ✅ Google Drive API (`drive.googleapis.com`)
- ✅ Google Calendar API (`calendar-json.googleapis.com`)
- ✅ Gmail API (`gmail.googleapis.com`)
- ✅ Google Sheets API (`sheets.googleapis.com`)

### Infraestrutura
- ✅ Cloud Run API (`run.googleapis.com`)
- ✅ Cloud Build API (`cloudbuild.googleapis.com`)
- ✅ Artifact Registry API (`artifactregistry.googleapis.com`)
- ✅ Cloud Functions API (`cloudfunctions.googleapis.com`)
- ✅ Pub/Sub API (`pubsub.googleapis.com`)

### Outros Serviços
- ✅ Google Maps API (`maps.googleapis.com`)
- ✅ YouTube Data API (`youtube.googleapis.com`)

## Service Accounts

### 1. ExzosNexus MCP Principal
- **Email**: `exzosnexus-mcp@exzosverce.iam.gserviceaccount.com`
- **Roles**:
  - `roles/aiplatform.user`
  - `roles/storage.objectViewer`
  - `roles/cloudtranslate.user`
  - `roles/cloudfunctions.invoker`

### 2. Vertex AI Service Account
- **Email**: `exzosnexus-vertex@exzosverce.iam.gserviceaccount.com`
- **Roles**:
  - `roles/aiplatform.user`
  - `roles/ml.developer`

## Recursos Criados

### Cloud Run
- **Service**: `exzosnexus-mcp`
- **URL**: `https://exzosnexus-mcp-[hash]-uc.a.run.app`
- **Region**: `us-central1`

### Artifact Registry
- **Repository**: `mcp-services`
- **Format**: Docker
- **Location**: `us-central1`

### Cloud Storage
- **Bucket**: `exzosverce-mcp-storage`
- **Location**: `us-central1`
- **Purpose**: Armazenar resultados e cache de MCPs

## URLs e Endpoints

### Produção
- **Vercel**: `https://exzosnexus.vercel.app`
- **Cloud Run**: `https://exzosnexus-mcp-[hash]-uc.a.run.app`
- **API Gateway**: `https://gateway-exzosverce.uc.gateway.dev`

### APIs
- **Vertex AI**: `https://us-central1-aiplatform.googleapis.com`
- **Gemini**: `https://generativelanguage.googleapis.com`

## Comandos Úteis

```bash
# Configurar projeto
gcloud config set project exzosverce

# Listar serviços
gcloud run services list --region=us-central1

# Ver logs
gcloud run services logs read exzosnexus-mcp --region=us-central1

# Deploy
gcloud run deploy exzosnexus-mcp \
  --image gcr.io/exzosverce/exzosnexus-mcp \
  --region us-central1

# Criar credenciais
gcloud iam service-accounts keys create credentials.json \
  --iam-account=exzosnexus-mcp@exzosverce.iam.gserviceaccount.com
```

## Custos Estimados (por mês)

- **Cloud Run**: ~$20 (1M requests)
- **Vertex AI**: ~$50 (100K requests Gemini Pro)
- **Cloud Storage**: ~$5 (100GB)
- **Artifact Registry**: ~$10
- **Total**: ~$85/mês

## Monitoramento

### Dashboards
- [Cloud Console](https://console.cloud.google.com/home/dashboard?project=exzosverce)
- [Cloud Run Metrics](https://console.cloud.google.com/run?project=exzosverce)
- [Vertex AI Workbench](https://console.cloud.google.com/vertex-ai?project=exzosverce)

### Alertas Configurados
- CPU > 80% por 5 minutos
- Memória > 90%
- Erros > 1% das requisições
- Latência P95 > 1000ms

## Segurança

### Práticas Implementadas
- ✅ Service accounts com menor privilégio
- ✅ API Keys restritas por domínio
- ✅ Secrets no Secret Manager
- ✅ VPC Service Controls
- ✅ Audit logs habilitados

### Compliance
- GDPR ready
- SOC 2 Type II (Google Cloud)
- ISO 27001

## Contatos

- **Admin**: admin@exzosdigital.com
- **Suporte**: support@exzosverce.com
- **Billing**: billing-alerts@exzosverce.com