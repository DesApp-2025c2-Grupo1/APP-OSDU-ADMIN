import { Header } from "../components/Header";

import { AffiliatesTable } from "../components/AffiliatesTable";
import { Sidebar } from "../components/Sidebar";
import type { Affiliate } from "../components/AffiliatesTable";
import { ButtonAddAffiliate } from "../util/ButtonAddAffiliate";
import { ButtonVolver } from "../util/ButtonVolver";
import { ButtonCreateAffiliate } from "../util/ButtonCreateAffiliate";
import { ButtonProgramateAffiliate } from "../util/ButtonProgramateAffiliate";


const affiliates: Affiliate[] = [
	{
		credencial: "0000001-01",
		dni: "DNI",
		nombre: "Joaquin",
		apellido: "Mogno",
		fechaNacimiento: "16/12/2002",
		plan: "210",
		direccion: "Calle Falsa 123",
	},
	{
		credencial: "0000001-02",
		dni: "DNI",
		nombre: "Juan",
		apellido: "Perez",
		fechaNacimiento: "10/05/2019",
		plan: "210",
		direccion: "Av. Vergara 742",
	},
	{
		credencial: "0000002-01",
		dni: "DNI",
		nombre: "Nombre",
		apellido: "Apellido",
		fechaNacimiento: "04/05/1958",
		plan: "210",
		direccion: "Calle Ejemplo 456",
	},
];

export function Home() {
	return (
		<div className="home-layout">
			<Sidebar />
			<div className="main-content">
				<Header />
				<ButtonAddAffiliate text="Agregar Afiliado" />
        <ButtonVolver text="Volver" onClick={() => window.history.back()} />
        <ButtonCreateAffiliate text="Dar de alta Afiliado" onClick={() => console.log("click")} />
        <ButtonProgramateAffiliate text="Programar Alta Afiliado" onClick={() => console.log("click")} />
				<AffiliatesTable affiliates={affiliates} />
			</div>
		</div>
	);


}