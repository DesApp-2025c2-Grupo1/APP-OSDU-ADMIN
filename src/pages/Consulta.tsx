import { useNavigate } from "react-router-dom";

type CardItem = {
  title: string;
  route: string; // ajustá estos paths a tus subrutas reales
  description?: string;
};

const CARDS: CardItem[] = [
  { title: "Alta de afiliados por periodo", route: "/consultas/altas-afiliados" },
  { title: "Alta de prestadores por periodo", route: "/consultas/altas-prestadores" },
  { title: "Cantidad de prestadores por especialidad", route: "/consultas/prestadores-por-especialidad" },
  { title: "Cantidad de prestadores por código postal", route: "/consultas/prestadores-por-cp" },
  { title: "Situaciones terapéuticas por afiliado", route: "/consultas/situaciones-por-afiliado" },
  { title: "Situaciones terapéuticas por grupo familiar", route: "/consultas/situaciones-por-grupo" },
  { title: "Prestadores sin agendas cargadas", route: "/consultas/prestadores-sin-agendas" },
];

export function Consultas() {
  const navigate = useNavigate();

  return (
    <main className="flex-1 min-w-0 w-full bg-slate-50 overflow-y-auto pb-24 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 sm:px-8 py-4 sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-700 text-slate-800">Consultas</h1>
          <p className="text-xs text-slate-400">Reportes y análisis del sistema</p>
        </div>
      </header>

      <div className="p-4 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CARDS.map((card) => (
            <button
              key={card.title}
              onClick={() => navigate(card.route)}
              className="text-left p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-teal-300 transition-all duration-200 h-full flex flex-col items-center justify-center text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-base font-600 text-slate-800 mb-2">{card.title}</h3>
              <p className="text-xs text-slate-400 mb-4">Análisis y reportes</p>
              <div className="inline-flex items-center gap-1.5 text-sm font-600 text-teal-600 group-hover:text-teal-700">
                <span>Acceder</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
