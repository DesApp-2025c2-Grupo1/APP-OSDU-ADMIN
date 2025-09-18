import { Header } from "../components/Header";
import { Button } from "../util/Button";
import { ButtonVolver } from "../util/ButtonVolver";
import { ButtonCreateAffiliate } from "../util/ButtonCreateAffiliate";
import { ButtonProgramateAffiliate } from "../util/ButtonProgramateAffiliate";

export function Home() {
    return (<>
        <Header />
        <Button text="Agregar Afiliado"/>
        <ButtonVolver text="Volver" onClick={() => window.history.back()} />
        <ButtonCreateAffiliate text="Dar de alta Afiliado" onClick={() => console.log("click")} />
        <ButtonProgramateAffiliate text="Programar Alta Afiliado" onClick={() => console.log("click")} />
    </>)
}