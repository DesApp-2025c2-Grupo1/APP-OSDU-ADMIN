import { useNavigate } from "react-router-dom";
import { ButtonVolver } from "../util/ButtonVolver";
export function SituacionesPorGrupo() {
    const navigate = useNavigate();
    return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Situaciones terapéuticas por grupo familiar
      </h1>

          <div className="mb-6">
            <ButtonVolver
              text="Volver"
              onClick={() => navigate("/consultas")}
            />
            </div>   

      <p className="text-gray-700">
        La idea es seleccionar un afiliado y mostrar a todos los miembros con situaciones pasadas y actuales
      </p>
    </div>
  );
}
