import { ButtonVolver } from "../util/ButtonVolver"
import { useNavigate } from "react-router-dom"

export function AgregarAfiliado() {
    const navigate = useNavigate();
    return (
        <>
        <ButtonVolver text="Volver" onClick={() => navigate("/home")} />
        <h1>Crear nuevo afiliado</h1>
        </>
    )
}