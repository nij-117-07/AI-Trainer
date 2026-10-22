'use client';

interface ProxyData {
  username: string;
  email: string;
  groups: string;
  logoutUrl: string;
  allHeaders: Record<string, string>;
}

export default function ProxyConsole({ proxyData }: { proxyData: ProxyData }) {
  
  const handleLogout = () => {
    // This terminates the session on the Authentik Proxy side
    window.location.href = proxyData.logoutUrl;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <h3 className="font-bold text-slate-800">Proxy-Injected Identity</h3>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-600 hover:text-white transition-colors text-sm font-medium"
          >
            Sign Out
          </button>
        </div>
        
        <p className="text-sm mb-4 text-slate-600">
          Authenticated as <strong>{proxyData.username}</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 rounded border border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</div>
            <div className="text-md font-medium text-slate-900">{proxyData.email}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Groups</div>
            <div className="text-md font-medium text-slate-900">{proxyData.groups}</div>
          </div>
        </div>
        
        <details className="mt-6">
          <summary className="text-sm cursor-pointer text-blue-600 hover:underline font-medium">
            View All Request Headers (Debug)
          </summary>
          <div className="mt-3">
            <pre className="p-4 bg-slate-900 text-cyan-400 rounded-md text-xs overflow-auto max-h-96 border border-slate-700">
              {JSON.stringify(proxyData.allHeaders, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}