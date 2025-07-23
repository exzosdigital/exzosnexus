'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [blocks, setBlocks] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, blocksRes] = await Promise.all([
        fetch('/api/mcp/dashboard'),
        fetch('/api/mcp/dashboard?action=blocks')
      ]);
      
      const dashboardData = await dashboardRes.json();
      const blocksData = await blocksRes.json();
      
      setStats(dashboardData);
      setBlocks(blocksData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    const res = await fetch('/api/mcp/dashboard?action=optimize');
    const result = await res.json();
    alert(`Otimização concluída! ${result.deactivated} MCPs desativados.`);
    fetchDashboardData();
  };

  const handleValidate = async () => {
    const res = await fetch('/api/mcp/dashboard?action=validate');
    const result = await res.json();
    
    if (result.valid) {
      alert('✅ Configuração válida!');
    } else {
      alert(`❌ Erros encontrados:\n${result.errors.join('\n')}`);
    }
  };

  const handleExport = async () => {
    const res = await fetch('/api/mcp/dashboard?action=export');
    const data = await res.json();
    
    // Download como CSV
    const csv = convertToCSV(data.data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mcp-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const convertToCSV = (data: any[]) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => `"${row[header] || ''}"`).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              ExzosNexus MCP Admin Dashboard
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md bg-blue-500 p-3">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total MCPs
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stats?.stats?.total || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md bg-green-500 p-3">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      MCPs Ativos
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stats?.stats?.active || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md bg-yellow-500 p-3">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Em Manutenção
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stats?.stats?.maintenance || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`rounded-md p-3 ${stats?.stats?.validation?.valid ? 'bg-green-500' : 'bg-red-500'}`}>
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Validação
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stats?.stats?.validation?.valid ? 'OK' : 'Erros'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex space-x-4">
          <button
            onClick={handleValidate}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Validar Configuração
          </button>
          <button
            onClick={handleOptimize}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Otimizar MCPs
          </button>
          <button
            onClick={handleExport}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            Exportar CSV
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('blocks')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'blocks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Blocos
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-2 gap-6">
                {Object.entries(stats?.blocks || {}).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                    <span className="font-medium capitalize">{category}</span>
                    <span className="text-2xl font-bold text-blue-600">{count as number}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'blocks' && blocks && (
              <div className="space-y-6">
                {Object.entries(blocks).map(([category, mcps]: [string, any]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold capitalize mb-3">{category}</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {mcps.map((mcp: any) => (
                        <div key={mcp.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{mcp.name}</p>
                            <p className="text-sm text-gray-500">{mcp.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded ${
                              mcp.status === 'active' ? 'bg-green-100 text-green-800' :
                              mcp.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {mcp.status}
                            </span>
                            <span className="text-sm text-gray-500">
                              Prioridade: {mcp.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}