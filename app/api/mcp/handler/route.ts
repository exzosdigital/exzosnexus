import { createMcpHandler } from "@/lib/mcp/handler";
import { MCPLibrary, getAllMCPs } from "@/lib/mcp/library";
import { z } from "zod";

// Handler principal que registra todas as ferramentas dos MCPs
const handler = createMcpHandler((server) => {
  // Ferramenta de busca de MCPs
  server.tool("search_mcps", {
    query: z.string().describe("Termo de busca"),
    category: z.string().optional().describe("Filtrar por categoria")
  }, async ({ query, category }) => {
    const { searchMCPs } = await import("@/lib/mcp/library");
    const results = searchMCPs(query);
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify(results, null, 2)
      }]
    };
  });

  // Ferramenta para listar MCPs
  server.tool("list_mcps", {
    category: z.string().optional().describe("Categoria específica")
  }, async ({ category }) => {
    if (category && MCPLibrary[category]) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify(MCPLibrary[category], null, 2)
        }]
      };
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          total: getAllMCPs().length,
          categories: Object.keys(MCPLibrary),
          servers: getAllMCPs()
        }, null, 2)
      }]
    };
  });

  // Ferramenta para executar comandos em MCPs específicos
  server.tool("execute_mcp", {
    server: z.string().describe("Nome do servidor MCP"),
    tool: z.string().describe("Nome da ferramenta"),
    args: z.record(z.any()).optional().describe("Argumentos da ferramenta")
  }, async ({ server, tool, args }) => {
    // Aqui implementaríamos a execução real
    // Por enquanto, simulamos
    return {
      content: [{
        type: "text",
        text: `Executando ${tool} no servidor ${server} com args: ${JSON.stringify(args)}`
      }]
    };
  });

  // Memory tools
  server.tool("memory_add", {
    content: z.string().describe("Conteúdo da memória"),
    metadata: z.record(z.any()).optional()
  }, async ({ content, metadata }) => ({
    content: [{
      type: "text",
      text: `Memória adicionada: ${content}`
    }]
  }));

  server.tool("memory_search", {
    query: z.string().describe("Buscar memórias")
  }, async ({ query }) => ({
    content: [{
      type: "text",
      text: `Buscando memórias com: ${query}`
    }]
  }));

  // GitHub tools
  server.tool("github_create_issue", {
    repo: z.string().describe("owner/repo"),
    title: z.string(),
    body: z.string().optional()
  }, async ({ repo, title, body }) => ({
    content: [{
      type: "text",
      text: `Issue criada em ${repo}: ${title}`
    }]
  }));

  // Notion tools
  server.tool("notion_search", {
    query: z.string().describe("Buscar no Notion")
  }, async ({ query }) => ({
    content: [{
      type: "text",
      text: `Buscando no Notion: ${query}`
    }]
  }));

  // Resources
  server.resource({
    uri: "mcp://servers",
    name: "Todos os MCPs",
    description: "Lista completa de MCPs disponíveis",
    mimeType: "application/json"
  }, async () => ({
    text: JSON.stringify(getAllMCPs(), null, 2)
  }));

  server.resource({
    uri: "mcp://categories",
    name: "Categorias",
    description: "Categorias de MCPs",
    mimeType: "application/json"
  }, async () => ({
    text: JSON.stringify(Object.keys(MCPLibrary), null, 2)
  }));

  // Prompts
  server.prompt({
    name: "setup_mcp",
    description: "Guia para configurar um MCP",
    arguments: [{
      name: "mcp_name",
      description: "Nome do MCP para configurar",
      required: true
    }]
  }, async ({ mcp_name }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Como configurar o MCP ${mcp_name}?`
      }
    }]
  }));

}, {
  capabilities: {
    tools: {},
    resources: {},
    prompts: {}
  }
});

export { handler as GET, handler as POST };