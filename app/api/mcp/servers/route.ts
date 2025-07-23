import { NextResponse } from 'next/server';
import { MCPLibrary } from '@/lib/mcp/library';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  
  if (category && MCPLibrary[category]) {
    return NextResponse.json({
      category,
      servers: MCPLibrary[category],
      total: Object.keys(MCPLibrary[category]).length
    });
  }
  
  // Retorna todos os servidores com estatísticas
  const stats = {
    totalServers: 0,
    byCategory: {} as Record<string, number>,
    officialServers: 0
  };
  
  Object.entries(MCPLibrary).forEach(([cat, servers]) => {
    const count = Object.keys(servers).length;
    stats.totalServers += count;
    stats.byCategory[cat] = count;
    
    Object.values(servers).forEach(server => {
      if (server.official) stats.officialServers++;
    });
  });
  
  return NextResponse.json({
    servers: MCPLibrary,
    stats,
    categories: Object.keys(MCPLibrary)
  });
}