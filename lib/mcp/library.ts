/**
 * Sistema Completo de MCPs para ExzosNexus
 * Biblioteca robusta com todos os MCPs disponíveis
 */

export const MCPLibrary = {
  // 🧠 Knowledge & Memory
  knowledge: {
    "memory": {
      id: "@modelcontextprotocol/memory",
      name: "Memory System",
      description: "Sistema de memória persistente baseado em grafo",
      category: "knowledge",
      official: true
    },
    "sequential-thinking": {
      id: "@modelcontextprotocol/sequential-thinking",
      name: "Sequential Thinking",
      description: "Resolução dinâmica de problemas",
      category: "knowledge",
      official: true
    },
    "knowledge-graph": {
      id: "@modelcontextprotocol/knowledge-graph",
      name: "Knowledge Graph",
      description: "Grafo de conhecimento para busca semântica",
      category: "knowledge"
    }
  },

  // 💬 Communication
  communication: {
    "notion": {
      id: "@makenotion/notion-mcp-server",
      name: "Notion",
      description: "Integração completa com Notion",
      category: "communication",
      official: true
    },
    "slack": {
      id: "@modelcontextprotocol/slack",
      name: "Slack",
      description: "Gerenciamento de canais e mensagens",
      category: "communication"
    },
    "discord": {
      id: "@chatbotkit/discord-mcp",
      name: "Discord",
      description: "Criar chatbots para Discord",
      category: "communication"
    },
    "whatsapp": {
      id: "@lharries/whatsapp-mcp",
      name: "WhatsApp",
      description: "Buscar e enviar mensagens",
      category: "communication"
    },
    "telegram": {
      id: "@modelcontextprotocol/telegram",
      name: "Telegram",
      description: "Gerenciar chats e mensagens",
      category: "communication"
    }
  },

  // 📅 Productivity
  productivity: {
    "google-calendar": {
      id: "@modelcontextprotocol/google-calendar",
      name: "Google Calendar",
      description: "Gerenciar eventos e calendários",
      category: "productivity"
    },
    "gmail": {
      id: "@modelcontextprotocol/gmail",
      name: "Gmail",
      description: "Ler, buscar e enviar emails",
      category: "productivity"
    },
    "google-tasks": {
      id: "@modelcontextprotocol/google-tasks",
      name: "Google Tasks",
      description: "Gerenciar tarefas",
      category: "productivity"
    },
    "google-drive": {
      id: "@isaacphi/mcp-gdrive",
      name: "Google Drive",
      description: "Acessar e gerenciar arquivos",
      category: "productivity"
    }
  },

  // 🤖 AI/ML
  aiml: {
    "huggingface": {
      id: "@modelcontextprotocol/huggingface",
      name: "Hugging Face",
      description: "Interagir com Hugging Face Hub",
      category: "aiml"
    },
    "openai": {
      id: "@modelcontextprotocol/openai",
      name: "OpenAI",
      description: "Integração com APIs OpenAI",
      category: "aiml"
    },
    "langchain": {
      id: "@langchain-ai/langchain-mcp-adapters",
      name: "LangChain",
      description: "Adaptadores LangChain para MCP",
      category: "aiml"
    },
    "vertex-ai": {
      id: "@google-cloud/vertex-ai-mcp",
      name: "Vertex AI",
      description: "Google Vertex AI - ML platform completa",
      category: "aiml",
      official: true
    },
    "gemini": {
      id: "@google/gemini-mcp",
      name: "Google Gemini",
      description: "Google Gemini AI - Modelos multimodais avançados",
      category: "aiml",
      official: true
    },
    "google-ai-studio": {
      id: "@google/ai-studio-mcp",
      name: "Google AI Studio",
      description: "Plataforma de desenvolvimento Google AI",
      category: "aiml"
    }
  },

  // 🗄️ Databases
  databases: {
    "postgresql": {
      id: "@modelcontextprotocol/postgres",
      name: "PostgreSQL",
      description: "Operações com PostgreSQL",
      category: "databases",
      official: true
    },
    "sqlite": {
      id: "@modelcontextprotocol/sqlite",
      name: "SQLite",
      description: "Operações com SQLite",
      category: "databases",
      official: true
    }
  },

  // 👨‍💻 Development
  development: {
    "git": {
      id: "@modelcontextprotocol/git",
      name: "Git",
      description: "Operações com repositórios Git",
      category: "development",
      official: true
    },
    "github": {
      id: "@ryan0204/github-repo-mcp",
      name: "GitHub",
      description: "Integração completa com GitHub",
      category: "development"
    },
    "docker": {
      id: "@modelcontextprotocol/docker",
      name: "Docker",
      description: "Gerenciar containers",
      category: "development"
    }
  }
};

// Funções auxiliares
export function getAllMCPs() {
  const allMCPs: any[] = [];
  
  Object.values(MCPLibrary).forEach(category => {
    Object.entries(category).forEach(([key, mcp]) => {
      allMCPs.push({
        key,
        ...mcp
      });
    });
  });
  
  return allMCPs;
}

export function searchMCPs(query: string) {
  const results: any[] = [];
  const searchTerm = query.toLowerCase();
  
  Object.values(MCPLibrary).forEach(category => {
    Object.entries(category).forEach(([key, mcp]) => {
      if (
        key.toLowerCase().includes(searchTerm) ||
        mcp.name.toLowerCase().includes(searchTerm) ||
        mcp.description.toLowerCase().includes(searchTerm) ||
        mcp.category.toLowerCase().includes(searchTerm)
      ) {
        results.push({
          key,
          ...mcp,
          score: calculateRelevance(mcp, searchTerm)
        });
      }
    });
  });
  
  return results.sort((a, b) => b.score - a.score);
}

function calculateRelevance(mcp: any, searchTerm: string) {
  let score = 0;
  
  if (mcp.name.toLowerCase() === searchTerm) score += 10;
  if (mcp.name.toLowerCase().includes(searchTerm)) score += 5;
  if (mcp.description.toLowerCase().includes(searchTerm)) score += 3;
  if (mcp.official) score += 2;
  
  return score;
}