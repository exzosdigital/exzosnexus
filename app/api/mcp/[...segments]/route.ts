import { z } from 'zod';
import { createMcpHandler } from 'mcp-handler';
import { mcpLibrary } from '@/lib/mcp/library';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getSecurityHeaders, getCORSHeaders } from './auth-middleware';

// Criar handler MCP principal
const handler = createMcpHandler(
  (server) => {
    // Ferramenta para listar todos os MCPs disponíveis
    server.tool(
      'list_mcps',
      'Lista todos os MCPs disponíveis no ExzosNexus',
      {
        category: z.string().optional().describe('Filtrar por categoria (ex: ai, dev, data)'),
        search: z.string().optional().describe('Buscar por nome ou descrição'),
      },
      async ({ category, search }) => {
        let mcps = Object.values(mcpLibrary);
        
        // Filtrar por categoria
        if (category) {
          mcps = mcps.filter(mcp => mcp.category === category);
        }
        
        // Buscar por nome ou descrição
        if (search) {
          const searchLower = search.toLowerCase();
          mcps = mcps.filter(mcp => 
            mcp.name.toLowerCase().includes(searchLower) ||
            mcp.description.toLowerCase().includes(searchLower)
          );
        }
        
        const result = mcps.map(mcp => ({
          id: mcp.id,
          name: mcp.name,
          description: mcp.description,
          category: mcp.category,
          official: mcp.official,
          featured: mcp.featured,
        }));
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }],
        };
      },
    );

    // Ferramenta para obter estatísticas dos MCPs
    server.tool(
      'get_mcp_stats',
      'Obtém estatísticas sobre os MCPs no sistema',
      {},
      async () => {
        const mcps = Object.values(mcpLibrary);
        const categories: Record<string, number> = {};
        
        mcps.forEach(mcp => {
          categories[mcp.category] = (categories[mcp.category] || 0) + 1;
        });
        
        const stats = {
          total: mcps.length,
          active: mcps.filter(m => m.status !== 'disabled').length,
          official: mcps.filter(m => m.official).length,
          featured: mcps.filter(m => m.featured).length,
          categories,
        };
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(stats, null, 2)
          }],
        };
      },
    );

    // Ferramenta para executar MCP específico
    server.tool(
      'execute_mcp',
      'Executa um MCP específico',
      {
        mcp_id: z.string().describe('ID do MCP a executar'),
        tool: z.string().describe('Nome da ferramenta do MCP'),
        args: z.any().optional().describe('Argumentos para a ferramenta'),
      },
      async ({ mcp_id, tool, args }) => {
        const mcp = mcpLibrary[mcp_id];
        
        if (!mcp) {
          return {
            content: [{
              type: 'text',
              text: `Erro: MCP '${mcp_id}' não encontrado`
            }],
          };
        }
        
        // Aqui seria implementada a lógica de execução real
        // Por enquanto, retornamos uma mensagem de simulação
        return {
          content: [{
            type: 'text',
            text: `MCP '${mcp.name}' executado com ferramenta '${tool}'.\nArgumentos: ${JSON.stringify(args, null, 2)}`
          }],
        };
      },
    );

    // Ferramenta para buscar MCPs do Google Cloud
    server.tool(
      'get_google_mcps',
      'Lista todos os MCPs relacionados ao Google Cloud',
      {},
      async () => {
        const googleMcps = Object.values(mcpLibrary).filter(mcp => 
          mcp.id.includes('google') || 
          mcp.id.includes('vertex') || 
          mcp.id.includes('gemini') ||
          mcp.description.toLowerCase().includes('google')
        );
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(googleMcps, null, 2)
          }],
        };
      },
    );

    // Ferramenta para validar configuração
    server.tool(
      'validate_config',
      'Valida a configuração do sistema ExzosNexus',
      {},
      async () => {
        const checks = {
          google_project_id: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
          vertex_ai_location: !!process.env.VERTEX_AI_LOCATION,
          google_ai_api_key: !!process.env.GOOGLE_AI_API_KEY,
          vercel_env: !!process.env.VERCEL,
          node_env: process.env.NODE_ENV,
        };
        
        const isValid = Object.values(checks).every(v => 
          typeof v === 'string' ? true : v
        );
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              valid: isValid,
              checks,
              project: process.env.GOOGLE_CLOUD_PROJECT_ID || 'exzosverce',
            }, null, 2)
          }],
        };
      },
    );
  },
  {
    name: 'ExzosNexus MCP Hub',
    version: '1.0.0',
    description: 'Central de gerenciamento para Model Context Protocols com integração Google Cloud',
  },
  { 
    basePath: '/api/mcp'
  },
);

// Handlers com autenticação
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, auth) => {
    const response = await handler(req);
    
    // Adicionar headers de segurança
    const headers = new Headers(response.headers);
    Object.entries(getSecurityHeaders()).forEach(([key, value]) => {
      headers.set(key, value as string);
    });
    
    // Adicionar CORS se necessário
    const origin = req.headers.get('origin');
    Object.entries(getCORSHeaders(origin)).forEach(([key, value]) => {
      headers.set(key, value as string);
    });
    
    return new NextResponse(response.body, {
      status: response.status,
      headers
    });
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, auth) => {
    const response = await handler(req);
    
    // Adicionar headers de segurança
    const headers = new Headers(response.headers);
    Object.entries(getSecurityHeaders()).forEach(([key, value]) => {
      headers.set(key, value as string);
    });
    
    // Adicionar CORS se necessário
    const origin = req.headers.get('origin');
    Object.entries(getCORSHeaders(origin)).forEach(([key, value]) => {
      headers.set(key, value as string);
    });
    
    return new NextResponse(response.body, {
      status: response.status,
      headers
    });
  });
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const headers = {
    ...getCORSHeaders(origin),
    ...getSecurityHeaders()
  };
  
  return new NextResponse(null, {
    status: 204,
    headers
  });
}

export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req, auth) => {
    const response = await handler(req);
    
    // Adicionar headers de segurança
    const headers = new Headers(response.headers);
    Object.entries(getSecurityHeaders()).forEach(([key, value]) => {
      headers.set(key, value as string);
    });
    
    return new NextResponse(response.body, {
      status: response.status,
      headers
    });
  });
}