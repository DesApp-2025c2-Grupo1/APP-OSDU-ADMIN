import { useMemo, useState } from "react";
import { AffiliatesTable } from "../components/AffiliatesTable";
import type { Affiliate } from "../components/AffiliatesTable";
import { ButtonAddAffiliate } from "../util/ButtonAddAffiliate";
import { useNavigate } from "react-router-dom";
import SearchDropdown from "../components/SearchDropdown";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";

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

const OPTIONS = [
  { value: "dni", label: "DNI" },
  { value: "nombre", label: "Nombre" },
  { value: "apellido", label: "Apellido" },
  { value: "credencial", label: "Credencial" },
  { value: "plan", label: "Plan" },
];

function norm(s: string) {
  return s
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function Home() {
  const [field, setField] = useState<string>(OPTIONS[0].value);
  const [query, setQuery] = useState<string>("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const navigate = useNavigate();

  const handleDeleteClick = (a: Affiliate) => {
    setSelectedAffiliate(a);
    setOpenModal(true);
  };

  const handleConfirmDelete = () => {
    console.log("Eliminar afiliado", selectedAffiliate);
    setOpenModal(false);
  };

  const filtered = useMemo(() => {
    if (!query) return affiliates;
    const q = norm(query);

    return affiliates.filter((a) => {
      const val =
        field === "dni" ? a.dni :
        field === "nombre" ? a.nombre :
        field === "apellido" ? a.apellido :
        field === "credencial" ? a.credencial :
        field === "plan" ? String(a.plan) :
        "";
      return norm(val).includes(q);
    });
  }, [field, query]);

  return (
    <div className="app-layout">
      <div className="body-layout">
        <div className="home-content">
          <div className="mb-3 flex items-center gap-3">
            <SearchDropdown
              options={OPTIONS}
              placeholder="Buscar"
              onSearch={(f, q) => { setField(f); setQuery(q); }}
              className="flex-1"
            />
            <div className="actions-bar">
              <ButtonAddAffiliate
                text="Agregar Afiliado"
                onClick={() => navigate("/home/agregarAfiliado")}
              />
            </div>
          </div>

          <AffiliatesTable
            affiliates={filtered}
            onEdit={(a) => navigate(`/home/editarAfiliado/${a.credencial}`)}
            onViewGroup={(a) => navigate(`/home/grupoFamiliar/${a.credencial}`)}
            onDelete={handleDeleteClick}
          />

          {selectedAffiliate && (
            <ConfirmDeleteModal
              open={openModal}
              onClose={() => setOpenModal(false)}
              onConfirm={handleConfirmDelete}
              afiliado={selectedAffiliate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
