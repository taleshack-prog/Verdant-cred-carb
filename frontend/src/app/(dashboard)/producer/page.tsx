'use client';
import { useState } from 'react';

interface TelemetryData {
  deviceId: string; powerKw: number; energyKwh: number;
  co2SavedKg: number; tokenBalance: number;
  status: 'OK' | 'ERROR' | 'OFFLINE'; lastUpdated: string;
}

const mockData: TelemetryData = {
  deviceId: 'INV-WEG-001', powerKw: 12.5, energyKwh: 450.2,
  co2SavedKg: 36.8, tokenBalance: 0.0368,
  status: 'OK', lastUpdated: new Date().toISOString(),
};

function StatusBadge({ status }: { status: string }) {
  const c = { OK: 'bg-green-100 text-green-800', ERROR: 'bg-red-100 text-red-800', OFFLINE: 'bg-gray-100 text-gray-500' };
  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${c[status as keyof typeof c]}`}>{status}</span>;
}

function Card({ label, value, unit, icon }: { label: string; value: string; unit: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex justify-between mb-2">
        <span className="text-slate-500 text-sm">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      <p className="text-slate-400 text-sm mt-1">{unit}</p>
    </div>
  );
}

export default function ProducerDashboard() {
  const [data] = useState(mockData);
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-verdant-700">Dashboard Produtor</h1>
            <p className="text-slate-500 mt-1 font-mono text-sm">{data.deviceId}</p>
          </div>
          <StatusBadge status={data.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card label="Potencia Atual" value={data.powerKw.toFixed(1)} unit="kW" icon="⚡" />
          <Card label="Energia Gerada" value={data.energyKwh.toFixed(1)} unit="kWh acumulado" icon="🔋" />
          <Card label="CO2 Evitado" value={data.co2SavedKg.toFixed(1)} unit="kg CO2e" icon="🌱" />
          <Card label="Tokens VCC" value={data.tokenBalance.toFixed(4)} unit="VCC (1 = 1 tCO2e)" icon="🪙" />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-2">Ultima Sincronizacao dMRV</h2>
          <p className="text-slate-500 font-mono text-sm">{data.lastUpdated}</p>
          <p className="text-xs text-slate-400 mt-2">Validado via NASA POWER API e registrado na Polygon Blockchain</p>
        </div>
      </div>
    </div>
  );
}
