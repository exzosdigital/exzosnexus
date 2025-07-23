import { NextResponse } from 'next/server';
import { mcpManager } from '@/lib/mcp/manager';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  switch (action) {
    case 'export':
      // Exporta dados para planilha/dashboard
      return NextResponse.json({
        data: mcpManager.exportToSpreadsheet(),
        timestamp: new Date().toISOString()
      });
      
    case 'validate':
      // Valida configuração
      const validation = mcpManager.validateConfiguration();
      return NextResponse.json(validation);
      
    case 'optimize':
      // Otimiza registro desativando MCPs não usados
      const optimization = mcpManager.optimizeRegistry();
      return NextResponse.json(optimization);
      
    case 'blocks':
      // Retorna MCPs organizados por blocos
      const blocks = {
        cloud: mcpManager.getMCPsByBlock('cloud'),
        devops: mcpManager.getMCPsByBlock('devops'),
        search: mcpManager.getMCPsByBlock('search'),
        messaging: mcpManager.getMCPsByBlock('messaging'),
        productivity: mcpManager.getMCPsByBlock('productivity'),
        databases: mcpManager.getMCPsByBlock('databases'),
        ai: mcpManager.getMCPsByBlock('ai'),
        monitoring: mcpManager.getMCPsByBlock('monitoring'),
        finance: mcpManager.getMCPsByBlock('finance'),
        security: mcpManager.getMCPsByBlock('security')
      };
      return NextResponse.json(blocks);
      
    case 'unused':
      // Lista MCPs não utilizados
      const days = parseInt(searchParams.get('days') || '30');
      const unused = mcpManager.getUnusedMCPs(days);
      return NextResponse.json({
        count: unused.length,
        mcps: unused
      });
      
    default:
      // Dashboard geral
      const stats = {
        total: mcpManager.exportToSpreadsheet().length,
        active: mcpManager.exportToSpreadsheet().filter(m => m.Status === 'active').length,
        inactive: mcpManager.exportToSpreadsheet().filter(m => m.Status === 'inactive').length,
        maintenance: mcpManager.exportToSpreadsheet().filter(m => m.Status === 'maintenance').length,
        validation: mcpManager.validateConfiguration()
      };
      
      return NextResponse.json({
        stats,
        blocks: {
          cloud: mcpManager.getMCPsByBlock('cloud').length,
          devops: mcpManager.getMCPsByBlock('devops').length,
          search: mcpManager.getMCPsByBlock('search').length,
          messaging: mcpManager.getMCPsByBlock('messaging').length,
          ai: mcpManager.getMCPsByBlock('ai').length
        }
      });
  }
}

export async function POST(request: Request) {
  const { mcp_id, action, data } = await request.json();
  
  switch (action) {
    case 'update_usage':
      mcpManager.updateUsage(mcp_id, data.success);
      return NextResponse.json({ success: true });
      
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}