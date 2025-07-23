export interface MCPConfig {
  id: string;
  name: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  apiKey?: string;
  baseURL?: string;
  enabled?: boolean;
}

// Configuração específica para Google Cloud
export const GOOGLE_CLOUD_CONFIG = {
  projectId: 'exzosverce',
  region: 'us-central1',
  apis: {
    vertexAI: {
      location: 'us-central1',
      models: ['gemini-1.5-pro', 'gemini-1.5-flash']
    },
    geminiAI: {
      model: 'gemini-pro',
      maxTokens: 8192
    }
  }
};

export async function loadMCPConfig(): Promise<Record<string, MCPConfig>> {
  // Em produção, carregar do banco de dados ou API
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implementar carregamento do KV ou database
    return {};
  }
  
  // Em desenvolvimento, usar configuração local
  return {
    'example-mcp': {
      id: 'example-mcp',
      name: 'Example MCP',
      command: 'node',
      args: ['./mcps/example.js'],
      enabled: true
    },
    'vertex-ai': {
      id: 'vertex-ai',
      name: 'Vertex AI MCP',
      env: {
        GOOGLE_CLOUD_PROJECT: 'exzosverce',
        VERTEX_AI_LOCATION: 'us-central1'
      },
      enabled: true
    },
    'gemini': {
      id: 'gemini',
      name: 'Google Gemini MCP',
      env: {
        GOOGLE_CLOUD_PROJECT: 'exzosverce'
      },
      enabled: true
    }
  };
}