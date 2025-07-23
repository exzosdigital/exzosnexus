import { NextResponse } from 'next/server';
import { MCPLibrary, getAllMCPs } from '@/lib/mcp/library';

export async function GET() {
  const allMCPs = getAllMCPs();
  
  return NextResponse.json({
    name: "ExzosNexus MCP Hub",
    version: "1.0.0",
    description: "Hub centralizado para 100+ MCPs do Model Context Protocol",
    endpoints: {
      servers: "/api/mcp/servers",
      search: "/api/mcp/search",
      tools: "/api/mcp/tools",
      execute: "/api/mcp/execute",
      connect: "/api/mcp/connect",
      disconnect: "/api/mcp/disconnect"
    },
    stats: {
      totalServers: allMCPs.length,
      categories: Object.keys(MCPLibrary).length,
      officialServers: allMCPs.filter(mcp => mcp.official).length
    },
    features: [
      "🚀 100+ MCPs integrados",
      "☁️ Execução remota na cloud",
      "💾 Cache distribuído",
      "🔍 Busca inteligente",
      "🔐 Autenticação OAuth",
      "📊 Analytics em tempo real"
    ]
  });
}