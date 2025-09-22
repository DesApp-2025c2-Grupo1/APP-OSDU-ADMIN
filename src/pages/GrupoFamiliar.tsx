import { useParams } from "react-router-dom";

export function GrupoFamiliar() {
  const { id } = useParams();
  return <h1>Grupo familiar del afiliado {id}</h1>;
}
