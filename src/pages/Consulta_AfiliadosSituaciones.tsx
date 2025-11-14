import { ButtonVolver } from "../util/ButtonVolver";
import { useNavigate } from "react-router-dom";

export function SituacionesPorAfiliado() {
 const navigate= useNavigate();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Situaciones terapéuticas por afiliado
      </h1>

      <div className="mb-6">
        <ButtonVolver
          text="Volver"
          onClick={() => navigate("/consultas")}
        />

      </div>
      <p className="text-gray-700">
        La idea es seleccionar un afiliado y mostrar sus situaciones, pasadas y actuales.
      </p>
    </div>
  );
}
