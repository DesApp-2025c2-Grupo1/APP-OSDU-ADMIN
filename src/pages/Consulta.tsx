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
    <div className="w-full p-6">

      {/* En mobile mostramos 1 x */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.map((card) => (
          <span
            key={card.title}
            aria-label={card.title}
            className="
              group text-left
              border-2 border-[#5FA92C]
              rounded-xl shadow-sm
              bg-gradient-to-b from-[#F2FAEC] via-white to-white
              hover:shadow-md hover:border-[#4c8c23]
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-[#5FA92C] focus:ring-offset-2
              p-4
            "
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {card.title}
              </h2>
            </div>

            {card.description && (
              <p className="mt-2 text-sm text-gray-600">{card.description}</p>
            )}

            {/* No hace falta pero sacando el boton queda muy chica cada card */}
            <div className="mt-4">
              <button
                onClick={() => navigate(card.route)}
                className="
                  inline-flex items-center gap-2
                  text-sm font-medium
                  border-2 border-[#5FA92C]
                  px-3 py-1.5 rounded-md
                  text-[#5FA92C]
                  group-hover:bg-[#5FA92C] group-hover:text-white
                  transition-colors
                "
              >
                Consultar
              </button>
            </div>
          </span>
        ))}
      </div>
    </div>
  );
}
