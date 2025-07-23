# Configuração Google Cloud Platform para ExzosNexus

## APIs Necessárias

### 1. Vertex AI
```bash
# Habilitar API
gcloud services enable aiplatform.googleapis.com

# Criar service account
gcloud iam service-accounts create exzosnexus-vertex \
  --display-name="ExzosNexus Vertex AI"

# Dar permissões
gcloud projects add-iam-policy-binding exzosverce \
  --member="serviceAccount:exzosnexus-vertex@exzosverce.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

### 2. Google AI (Gemini)
```bash
# Habilitar API
gcloud services enable generativelanguage.googleapis.com

# API Key via Console
# https://console.cloud.google.com/apis/credentials
```

### 3. Google Drive
```bash
gcloud services enable drive.googleapis.com
```

### 4. Google Calendar
```bash
gcloud services enable calendar-json.googleapis.com
```

### 5. Gmail
```bash
gcloud services enable gmail.googleapis.com
```

### 6. Google Sheets
```bash
gcloud services enable sheets.googleapis.com
```

## Variáveis de Ambiente

Adicione ao `.env.local`:

```env
# Google Cloud Project
GOOGLE_CLOUD_PROJECT_ID=exzosverce
GOOGLE_CLOUD_REGION=us-central1

# Vertex AI
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
VERTEX_AI_LOCATION=us-central1

# Google AI (Gemini)
GOOGLE_AI_API_KEY=sua-api-key-aqui
GOOGLE_GENERATIVE_AI_API_KEY=sua-api-key-aqui

# OAuth 2.0 (para Google Workspace)
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_REDIRECT_URI=https://exzosnexus.vercel.app/api/auth/callback/google

# APIs específicas
GOOGLE_MAPS_API_KEY=sua-maps-api-key
GOOGLE_YOUTUBE_API_KEY=sua-youtube-api-key
```

## Criar Credenciais

### 1. Service Account (Vertex AI)

1. Acesse: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Criar conta de serviço
3. Nome: `exzosnexus-vertex`
4. Roles:
   - Vertex AI User
   - Storage Object Viewer
5. Criar chave JSON
6. Salvar como `vertex-ai-key.json`

### 2. OAuth 2.0 (Google Workspace)

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Criar credenciais > ID do cliente OAuth
3. Tipo: Aplicativo da Web
4. URIs de redirecionamento:
   - `https://exzosnexus.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (dev)

### 3. API Keys

1. Criar chave de API
2. Restringir por:
   - APIs: Gemini, Maps, YouTube
   - Referrers HTTP: `exzosnexus.vercel.app/*`

## MCPs Google Disponíveis

```typescript
// lib/mcp/google-services.ts
export const googleMCPs = {
  "vertex-ai": {
    credentials: "GOOGLE_APPLICATION_CREDENTIALS",
    apis: ["aiplatform.googleapis.com"]
  },
  "gemini": {
    credentials: "GOOGLE_AI_API_KEY",
    apis: ["generativelanguage.googleapis.com"]
  },
  "google-drive": {
    credentials: "GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET",
    apis: ["drive.googleapis.com"]
  },
  "google-calendar": {
    credentials: "GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET",
    apis: ["calendar-json.googleapis.com"]
  },
  "gmail": {
    credentials: "GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET",
    apis: ["gmail.googleapis.com"]
  },
  "google-sheets": {
    credentials: "GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET",
    apis: ["sheets.googleapis.com"]
  },
  "google-maps": {
    credentials: "GOOGLE_MAPS_API_KEY",
    apis: ["maps.googleapis.com"]
  }
}
```

## Segurança

1. **Nunca commitar** arquivos `.json` de service account
2. **Use Vercel Environment Variables** para produção
3. **Restrinja API Keys** por domínio e API
4. **Monitore uso** no Cloud Console
5. **Configure quotas** para evitar custos inesperados

## Custos Estimados

- Vertex AI: $0.0005 por 1K caracteres (Gemini Pro)
- Google AI: Free tier: 60 requests/min
- Google Maps: $200 crédito mensal grátis
- Google Workspace APIs: Geralmente gratuitas

## Deploy na Vercel

1. Adicione as variáveis no Vercel Dashboard
2. Para service account JSON:
   ```bash
   # Converta para base64
   base64 -i vertex-ai-key.json | pbcopy
   
   # No Vercel, adicione:
   GOOGLE_CREDENTIALS_BASE64=cole-aqui
   ```

3. No código, decodifique:
   ```typescript
   const credentials = Buffer.from(
     process.env.GOOGLE_CREDENTIALS_BASE64!, 
     'base64'
   ).toString();
   ```