import { useParams } from "react-router-dom";

export function EditarAfiliado() {
  const { id } = useParams(); // id = credencial    
  return <h1>Editar afiliado {id}</h1>;
}
