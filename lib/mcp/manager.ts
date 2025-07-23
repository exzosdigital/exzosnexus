/**
 * MCP Manager - Sistema de Gerenciamento para 100+ MCPs
 * Organiza, versiona e monitora todos os MCPs do ExzosNexus
 */

import { MCPLibrary } from './library';

export interface MCPConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  status: 'active' | 'inactive' | 'deprecated' | 'maintenance';
  usage: {
    lastUsed: Date | null;
    totalCalls: number;
    errorRate: number;
  };
  fallback?: string; // ID do MCP de fallback
  priority: number; // 1-10, para ordenação
  tags: string[];
  credentials?: {
    required: string[];
    optional: string[];
  };
}

export class MCPManager {
  private mcpRegistry: Map<string, MCPConfig> = new Map();
  private categoryBlocks = {
    cloud: ['aws', 'gcp', 'azure', 'vercel', 'cloudflare'],
    devops: ['docker', 'kubernetes', 'git', 'github', 'gitlab'],
    search: ['brave-search', 'perplexity', 'google-search', 'bing'],
    messaging: ['slack', 'discord', 'telegram', 'whatsapp', 'email'],
    productivity: ['notion', 'todoist', 'calendar', 'drive', 'sheets'],
    databases: ['postgres', 'sqlite', 'mongodb', 'redis', 'bigquery'],
    ai: ['openai', 'anthropic', 'huggingface', 'langchain'],
    monitoring: ['datadog', 'sentry', 'prometheus', 'grafana'],
    finance: ['stripe', 'paypal', 'crypto', 'stocks'],
    security: ['vault', 'gitguardian', '1password', 'auth0']
  };

  constructor() {
    this.initializeRegistry();
  }

  private initializeRegistry() {
    // Inicializa o registro com todos os MCPs
    const allMCPs = this.getAllMCPsWithMetadata();
    
    allMCPs.forEach(mcp => {
      this.mcpRegistry.set(mcp.id, {
        ...mcp,
        version: '1.0.0',
        status: 'active',
        usage: {
          lastUsed: null,
          totalCalls: 0,
          errorRate: 0
        },
        priority: this.calculatePriority(mcp),
        tags: this.generateTags(mcp)
      });
    });
  }

  private calculatePriority(mcp: any): number {
    // MCPs oficiais têm prioridade maior
    if (mcp.official) return 9;
    
    // Por categoria
    const categoryPriorities: Record<string, number> = {
      cloud: 8,
      devops: 8,
      databases: 7,
      messaging: 7,
      productivity: 6,
      ai: 6,
      search: 5,
      monitoring: 5,
      finance: 4,
      security: 9
    };
    
    return categoryPriorities[mcp.category] || 5;
  }

  private generateTags(mcp: any): string[] {
    const tags = [mcp.category];
    
    if (mcp.official) tags.push('official');
    if (mcp.name.toLowerCase().includes('google')) tags.push('google');
    if (mcp.name.toLowerCase().includes('microsoft')) tags.push('microsoft');
    if (mcp.name.toLowerCase().includes('aws')) tags.push('aws');
    
    return tags;
  }

  // Gerenciamento de MCPs por blocos
  getMCPsByBlock(block: keyof typeof this.categoryBlocks): MCPConfig[] {
    const mcpsInBlock = this.categoryBlocks[block];
    return Array.from(this.mcpRegistry.values())
      .filter(mcp => mcpsInBlock.some(id => mcp.id.includes(id)))
      .sort((a, b) => b.priority - a.priority);
  }

  // Redundância: retorna MCP principal e fallback
  getMCPWithFallback(id: string): { primary: MCPConfig | null, fallback: MCPConfig | null } {
    const primary = this.mcpRegistry.get(id) || null;
    const fallback = primary?.fallback ? this.mcpRegistry.get(primary.fallback) || null : null;
    
    return { primary, fallback };
  }

  // Monitora uso e desativa MCPs não utilizados
  updateUsage(id: string, success: boolean) {
    const mcp = this.mcpRegistry.get(id);
    if (!mcp) return;
    
    mcp.usage.lastUsed = new Date();
    mcp.usage.totalCalls++;
    
    if (!success) {
      const errorCount = Math.ceil(mcp.usage.totalCalls * mcp.usage.errorRate) + 1;
      mcp.usage.errorRate = errorCount / mcp.usage.totalCalls;
    }
    
    // Desativa automaticamente se taxa de erro > 50%
    if (mcp.usage.errorRate > 0.5 && mcp.usage.totalCalls > 10) {
      mcp.status = 'maintenance';
    }
  }

  // Revisão periódica - retorna MCPs não utilizados
  getUnusedMCPs(days: number = 30): MCPConfig[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return Array.from(this.mcpRegistry.values())
      .filter(mcp => 
        mcp.status === 'active' && 
        (!mcp.usage.lastUsed || mcp.usage.lastUsed < cutoffDate)
      );
  }

  // Exporta configuração para dashboard/planilha
  exportToSpreadsheet(): any[] {
    return Array.from(this.mcpRegistry.values()).map(mcp => ({
      ID: mcp.id,
      Nome: mcp.name,
      Categoria: mcp.category,
      Status: mcp.status,
      Versão: mcp.version,
      'Último Uso': mcp.usage.lastUsed?.toISOString() || 'Nunca',
      'Total Chamadas': mcp.usage.totalCalls,
      'Taxa de Erro': `${(mcp.usage.errorRate * 100).toFixed(2)}%`,
      Prioridade: mcp.priority,
      Tags: mcp.tags.join(', '),
      Fallback: mcp.fallback || 'N/A'
    }));
  }

  // Validação de configuração
  validateConfiguration(): { valid: boolean, errors: string[] } {
    const errors: string[] = [];
    
    // Verifica redundância em áreas críticas
    const criticalAreas = ['cloud', 'databases', 'messaging', 'security'];
    
    criticalAreas.forEach(area => {
      const mcpsInArea = this.getMCPsByBlock(area as any);
      if (mcpsInArea.filter(m => m.status === 'active').length < 2) {
        errors.push(`Área crítica '${area}' tem menos de 2 MCPs ativos (redundância)`);
      }
    });
    
    // Verifica MCPs com alta taxa de erro
    Array.from(this.mcpRegistry.values()).forEach(mcp => {
      if (mcp.usage.errorRate > 0.3 && mcp.status === 'active') {
        errors.push(`MCP '${mcp.name}' tem taxa de erro alta: ${(mcp.usage.errorRate * 100).toFixed(2)}%`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Otimização: desativa MCPs raramente usados
  optimizeRegistry() {
    const unusedMCPs = this.getUnusedMCPs(60);
    
    unusedMCPs.forEach(mcp => {
      mcp.status = 'inactive';
    });
    
    return {
      deactivated: unusedMCPs.length,
      mcps: unusedMCPs.map(m => m.name)
    };
  }

  private getAllMCPsWithMetadata(): any[] {
    const allMCPs: any[] = [];
    
    Object.entries(MCPLibrary).forEach(([category, mcps]) => {
      Object.entries(mcps).forEach(([key, mcp]) => {
        allMCPs.push({
          ...mcp,
          key,
          category
        });
      });
    });
    
    return allMCPs;
  }
}

// Singleton para uso global
export const mcpManager = new MCPManager();