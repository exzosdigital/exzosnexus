import { NextRequest } from 'next/server';
import crypto from 'crypto';

// Interface para resultado de autenticação
export interface AuthResult {
  authenticated: boolean;
  userId?: string;
  scopes?: string[];
  error?: string;
}

// Tipos de autenticação suportados
export type AuthType = 'api-key' | 'bearer' | 'oauth';

// Classe principal de segurança MCP
export class MCPSecurity {
  private readonly apiKeys: Map<string, string>;
  private readonly rateLimit: Map<string, number[]>;
  
  constructor() {
    this.apiKeys = new Map();
    this.rateLimit = new Map();
    
    // Carregar API keys do ambiente
    const envApiKey = process.env.MCP_API_KEY;
    if (envApiKey) {
      this.apiKeys.set(envApiKey, 'default');
    }
  }

  // Autenticar requisição
  async authenticate(req: NextRequest): Promise<AuthResult> {
    // Verificar API Key
    const apiKey = req.headers.get('x-api-key');
    if (apiKey && this.apiKeys.has(apiKey)) {
      return {
        authenticated: true,
        userId: this.apiKeys.get(apiKey),
        scopes: ['read', 'write']
      };
    }

    // Verificar Bearer Token
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const result = await this.validateBearerToken(token);
      if (result.authenticated) {
        return result;
      }
    }

    // Verificar OAuth (se configurado)
    if (process.env.GOOGLE_CLIENT_ID) {
      const oauthToken = req.headers.get('x-oauth-token');
      if (oauthToken) {
        const result = await this.validateOAuthToken(oauthToken);
        if (result.authenticated) {
          return result;
        }
      }
    }

    return {
      authenticated: false,
      error: 'Authentication required'
    };
  }

  // Validar Bearer Token
  private async validateBearerToken(token: string): Promise<AuthResult> {
    try {
      // Para produção, implementar validação JWT real
      // Por enquanto, validação simples
      if (token === process.env.MCP_BEARER_TOKEN) {
        return {
          authenticated: true,
          userId: 'bearer-user',
          scopes: ['read', 'write']
        };
      }
    } catch (error) {
      console.error('Bearer token validation error:', error);
    }

    return {
      authenticated: false,
      error: 'Invalid bearer token'
    };
  }

  // Validar OAuth Token
  private async validateOAuthToken(token: string): Promise<AuthResult> {
    try {
      // Validar com Google OAuth
      const response = await fetch('https://oauth2.googleapis.com/tokeninfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `access_token=${token}`,
      });

      if (response.ok) {
        const data = await response.json();
        return {
          authenticated: true,
          userId: data.email,
          scopes: data.scope?.split(' ') || ['read']
        };
      }
    } catch (error) {
      console.error('OAuth validation error:', error);
    }

    return {
      authenticated: false,
      error: 'Invalid OAuth token'
    };
  }

  // Verificar rate limit
  checkRateLimit(identifier: string, limit: number = 60, window: number = 60000): boolean {
    const now = Date.now();
    const requests = this.rateLimit.get(identifier) || [];
    
    // Limpar requisições antigas
    const validRequests = requests.filter(time => now - time < window);
    
    if (validRequests.length >= limit) {
      return false; // Rate limit excedido
    }
    
    // Adicionar nova requisição
    validRequests.push(now);
    this.rateLimit.set(identifier, validRequests);
    
    return true;
  }

  // Gerar API Key segura
  generateApiKey(): string {
    return `mcp_${crypto.randomBytes(32).toString('hex')}`;
  }

  // Hash de senha (para armazenamento seguro)
  async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  // Verificar senha
  async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [salt, hash] = storedHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }

  // Sanitizar entrada
  sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      // Remover caracteres perigosos
      return input.replace(/[<>]/g, '');
    }
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    return input;
  }

  // Validar estrutura de requisição MCP
  validateMCPRequest(request: any): boolean {
    // Verificar estrutura JSON-RPC 2.0
    if (!request.jsonrpc || request.jsonrpc !== '2.0') {
      return false;
    }
    
    // Verificar método
    if (!request.method || typeof request.method !== 'string') {
      return false;
    }
    
    // ID deve ser string, número ou null
    if (request.id !== undefined && 
        typeof request.id !== 'string' && 
        typeof request.id !== 'number' && 
        request.id !== null) {
      return false;
    }
    
    return true;
  }

  // Criar resposta de erro padronizada
  createErrorResponse(id: any, code: number, message: string): object {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message
      }
    };
  }

  // Limpar dados sensíveis de logs
  sanitizeForLogging(data: any): any {
    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization'];
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeForLogging(value);
        }
      }
      return sanitized;
    }
    
    return data;
  }
}

// Singleton para uso global
export const mcpSecurity = new MCPSecurity();