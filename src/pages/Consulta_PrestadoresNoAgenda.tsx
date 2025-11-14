import { ButtonVolver } from "../util/ButtonVolver";
import { useNavigate } from "react-router-dom";
export function PrestadoresSinAgendas() {
  const navigate = useNavigate();
    return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Prestadores sin agendas cargadas
      </h1>
      <div className="mb-6">
                  <ButtonVolver
                    text="Volver"
                    onClick={() => navigate("/consultas")}
                  />
                  </div>   
      <p className="text-gray-700">
        Acá listás los prestadores que no tienen agendas de turnos cargadas.
      </p>
    </div>
  );
}
