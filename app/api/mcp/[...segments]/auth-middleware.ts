import { NextRequest, NextResponse } from 'next/server';
import { mcpSecurity } from '@/lib/mcp/auth/security';

// Middleware de autenticação para MCPs
export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest, auth: any) => Promise<NextResponse>
) {
  // Verificar rate limit
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  
  if (!mcpSecurity.checkRateLimit(clientIp, 60, 60000)) {
    return NextResponse.json(
      mcpSecurity.createErrorResponse(
        null,
        -32000,
        'Rate limit exceeded. Please try again later.'
      ),
      { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '60',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString()
        }
      }
    );
  }

  // Autenticar requisição
  const authResult = await mcpSecurity.authenticate(request);
  
  if (!authResult.authenticated) {
    return NextResponse.json(
      mcpSecurity.createErrorResponse(
        null,
        -32001,
        authResult.error || 'Authentication required'
      ),
      { 
        status: 401,
        headers: {
          'WWW-Authenticate': 'Bearer realm="ExzosNexus MCP", API-Key'
        }
      }
    );
  }

  // Validar corpo da requisição se for POST
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      
      // Sanitizar entrada
      const sanitizedBody = mcpSecurity.sanitizeInput(body);
      
      // Validar estrutura MCP
      if (!mcpSecurity.validateMCPRequest(sanitizedBody)) {
        return NextResponse.json(
          mcpSecurity.createErrorResponse(
            body.id || null,
            -32600,
            'Invalid MCP request format'
          ),
          { status: 400 }
        );
      }
      
      // Criar nova requisição com corpo sanitizado
      const sanitizedRequest = new NextRequest(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(sanitizedBody)
      });
      
      // Adicionar informações de autenticação
      (sanitizedRequest as any).auth = authResult;
      
      return handler(sanitizedRequest, authResult);
    } catch (error) {
      return NextResponse.json(
        mcpSecurity.createErrorResponse(
          null,
          -32700,
          'Parse error: Invalid JSON'
        ),
        { status: 400 }
      );
    }
  }

  // Para outros métodos, passar direto
  return handler(request, authResult);
}

// Headers de segurança
export function getSecurityHeaders(): HeadersInit {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  };
}

// Configuração CORS para MCPs
export function getCORSHeaders(origin?: string | null): HeadersInit {
  const allowedOrigins = [
    'https://exzosnexus.vercel.app',
    'https://claude.ai',
    'http://localhost:3000'
  ];
  
  const corsHeaders: HeadersInit = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-OAuth-Token',
    'Access-Control-Max-Age': '86400',
  };
  
  if (origin && allowedOrigins.includes(origin)) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
    corsHeaders['Access-Control-Allow-Credentials'] = 'true';
  }
  
  return corsHeaders;
}