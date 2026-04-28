'use client';

const devices = [
  { id: 'INV-WEG-001', type: 'WEG', status: 'OK', confidence: 0.99, lastSeen: '2 min atras' },
  { id: 'INV-FRONIUS-002', type: 'FRONIUS', status: 'OK', confidence: 0.97, lastSeen: '5 min atras' },
  { id: 'INV-SUNGROW-003', type: 'SUNGROW', status: 'ERROR', confidence: 0.71, lastSeen: '30 min atras' },
  { id: 'BIO-SENSOR-001', type: 'BIOGAS_FLOW', status: 'OK', confidence: 0.94, lastSeen: '1 min atras' },
];

export default function AdminConsole() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-verdant-700 mb-8">Console Admin</h1>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-700">Dispositivos Conectados</h2>
          </div>
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {['Device ID', 'Tipo', 'Status', 'Confianca IA', 'Ultima Leitura'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {devices.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm">{d.id}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">{d.type}</span></td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-medium ${d.status === 'OK' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{d.status}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-24">
                        <div className="bg-verdant-500 h-2 rounded-full" style={{ width: `${d.confidence * 100}%` }} />
                      </div>
                      <span className="text-sm text-slate-600">{(d.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{d.lastSeen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
