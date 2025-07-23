'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MCPStats {
  total: number;
  active: number;
  categories: Record<string, number>;
}

export default function HomePage() {
  const [stats, setStats] = useState<MCPStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/mcp/dashboard');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryIcons: Record<string, string> = {
    ai: '🤖',
    dev: '⚡',
    data: '📊',
    web: '🌐',
    mobile: '📱',
    cloud: '☁️',
    security: '🔒',
    tools: '🛠️'
  };

  const categoryNames: Record<string, string> = {
    ai: 'AI & Machine Learning',
    dev: 'Desenvolvimento',
    data: 'Dados & Analytics',
    web: 'Web & APIs',
    mobile: 'Mobile',
    cloud: 'Cloud Services',
    security: 'Segurança',
    tools: 'Ferramentas'
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              ExzosNexus MCP Hub
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Central de gerenciamento para Model Context Protocols (MCPs).
              Integre e gerencie mais de 100 MCPs com Google Cloud e Vercel.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/admin"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Acessar Dashboard
              </Link>
              <a
                href="https://github.com/exzosdigital/exzosnexus"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                Ver no GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Estatísticas do Sistema
          </h2>
          
          {loading ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stats.total}
                </div>
                <div className="text-gray-600">MCPs Disponíveis</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {stats.active}
                </div>
                <div className="text-gray-600">MCPs Ativos</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {Object.keys(stats.categories).length}
                </div>
                <div className="text-gray-600">Categorias</div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            MCPs por Categoria
          </h2>
          
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {Object.entries(stats.categories).map(([category, count]) => (
                <div
                  key={category}
                  className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition"
                >
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">
                      {categoryIcons[category] || '📦'}
                    </span>
                    <h3 className="font-semibold text-lg">
                      {categoryNames[category] || category}
                    </h3>
                  </div>
                  <div className="text-2xl font-bold text-gray-700">
                    {count} MCPs
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Recursos Principais
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">☁️</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Cloud-First</h3>
              <p className="text-gray-600">
                Integração com Google Cloud Platform (projeto exzosverce) e Vercel Edge Functions
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Otimização de Tokens</h3>
              <p className="text-gray-600">
                Redução de até 60% no uso de tokens com cache inteligente e compressão
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔧</span>
              </div>
              <h3 className="font-bold text-xl mb-2">100+ Integrações</h3>
              <p className="text-gray-600">
                Biblioteca completa de MCPs incluindo Vertex AI, Gemini, e ferramentas populares
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Configure seus MCPs e integre com Claude Code em minutos
          </p>
          <Link
            href="/admin"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Acessar Dashboard Admin
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">© 2025 ExzosNexus MCP Hub</p>
          <p className="text-gray-400">
            Powered by Google Cloud Platform (exzosverce) & Vercel
          </p>
        </div>
      </footer>
    </main>
  );
}