import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-verdant-50 to-white p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-verdant-700 mb-4">Verdant</h1>
        <p className="text-xl text-slate-600 mb-2">Plataforma SaaS de Tokenizacao de Ativos Ambientais</p>
        <p className="text-sm text-slate-400 mb-8">dMRV | Polygon | GPT-4o-mini | Creditos de Carbono e Metano</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/producer" className="px-6 py-3 bg-verdant-600 text-white rounded-lg hover:bg-verdant-700 font-semibold transition-colors">
            Dashboard Produtor
          </Link>
          <Link href="/admin" className="px-6 py-3 border-2 border-verdant-600 text-verdant-700 rounded-lg hover:bg-verdant-50 font-semibold transition-colors">
            Console Admin
          </Link>
        </div>
      </div>
    </main>
  );
}
