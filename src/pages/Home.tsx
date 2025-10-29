import { useEffect, useMemo, useState } from "react";
import { AffiliatesTable } from "../components/AffiliatesTable";
import type { Affiliate } from "../components/AffiliatesTable";
import { ButtonAddAffiliate } from "../util/ButtonAddAffiliate";
import { useNavigate } from "react-router-dom";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import { ViewAffiliatePopup } from "../components/ViewAffiliatePopup";
import { EditAffiliatePopup } from "../components/EditAffiliatePopup";
import SearchDropdown from "../components/SearchDropdown";

const API_URL = import.meta.env.VITE_API_URL;

const OPTIONS = [
  { value: "dni", label: "DNI" },
  { value: "nombre", label: "Nombre" },
  { value: "apellido", label: "Apellido" },
  { value: "credencial", label: "Credencial" },
  { value: "plan", label: "Plan" },
];

function norm(s: string) {
  return s.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function Home() {
  const [field, setField] = useState<string>(OPTIONS[0].value);
  const [query, setQuery] = useState<string>("");

  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [affiliatesData, setAffiliatesData] = useState<Affiliate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAffiliates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(API_URL + "/affiliates");
        
        if (!response.ok) {
          throw new Error("Error al obtener los afiliados");
        }
        
        const data = await response.json();
        setAffiliatesData(data.affiliates);
        // console.log("Afiliados obtenidos:", data.affiliates);
      } catch (error) {
        console.error("Error al obtener los afiliados:", error);
        setError((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAffiliates();
  }, []);

  const fieldMap: Record<string, (a: Affiliate) => string> = {
    dni: (a) => a.dni,
    nombre: (a) => a.nombre,
    apellido: (a) => a.apellido,
    credencial: (a) => a.credencial,
    plan: (a) => a.plan,
  };

  const filtered = useMemo(() => {
    if (!query) return affiliatesData;
    const q = norm(query);
    return affiliatesData.filter((a) => norm(fieldMap[field](a)).includes(q));
  }, [field, query, affiliatesData]);

  const handleOptionClick = (option: string, affiliate: Affiliate) => {
    // IMPORTANTE: Siempre establecer el afiliado seleccionado primero
    setSelectedAffiliate(affiliate);

    if (option === "Editar") {
      setShowEditPopup(true);
    }
    
    if (option === "Ver grupo familiar") {
      console.log("Navegando a grupo familiar:", affiliate.idGrupoFamiliarFK);
      navigate(`/home/grupoFamiliar/${affiliate.idGrupoFamiliarFK}`);
    }
    
    if (option === "Ver detalles") {
      setShowViewPopup(true);
    }
    
    if (option === "Dar de baja") {
      setShowDeleteDialog(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAffiliate) return;

    try {
      // Aquí iría la lógica para dar de baja en el backend
      // const response = await fetch(`${API_URL}/affiliates/${selectedAffiliate.dni}`, {
      //   method: 'DELETE',
      // });
      
      console.log("Afiliado dado de baja:", selectedAffiliate);
      
      // Actualizar la lista de afiliados removiendo el eliminado
      setAffiliatesData(prev => 
        prev.filter(a => a.credencial !== selectedAffiliate.credencial)
      );
      
    } catch (error) {
      console.error("Error al dar de baja:", error);
    } finally {
      setShowDeleteDialog(false);
      setSelectedAffiliate(null);
    }
  };

  const handleSaveEdit = async (updatedAffiliate: Affiliate) => {
    try {
      // Aquí iría la lógica para actualizar en el backend
      // const response = await fetch(`${API_URL}/affiliates/${updatedAffiliate.dni}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedAffiliate),
      // });
      
      console.log("Afiliado editado:", updatedAffiliate);
      
      // Actualizar la lista local
      setAffiliatesData(prev => 
        prev.map(a => 
          a.credencial === updatedAffiliate.credencial ? updatedAffiliate : a
        )
      );
      
      setShowEditPopup(false);
      setSelectedAffiliate(null);
    } catch (error) {
      console.error("Error al editar:", error);
    }
  };

  return (
    <div className="w-full p-6 space-y-4">
      {/* Barra superior */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        {/* 🔍 Buscador */}
        <SearchDropdown
          options={OPTIONS}
          placeholder="Buscar"
          onSearch={(f, q) => { setField(f); setQuery(q); }}
          className="w-full md:w-2/3"
        />

        {/* ➕ Botón */}
        <div className="self-start md:self-auto">
          <ButtonAddAffiliate
            text="Agregar Afiliado"
            onClick={() => navigate("/home/agregarAfiliado")}
          />
        </div>
      </div>

      {/* Estado de carga */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5FA92C]"></div>
          <span className="ml-3 text-gray-600">Cargando afiliados...</span>
        </div>
      )}

      {/* Estado de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      )}

      {/* Tabla */}
      {!isLoading && !error && (
        <div className="rounded-md shadow-sm border border-gray-200">
          <AffiliatesTable 
            affiliates={filtered} 
            onOptionClick={handleOptionClick} 
          />
        </div>
      )}

      {/* Mensaje si no hay resultados */}
      {!isLoading && !error && filtered.length === 0 && affiliatesData.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron resultados para "{query}"
        </div>
      )}

      {/* Popup para Ver Detalles */}
      {showViewPopup && selectedAffiliate && (
        <ViewAffiliatePopup
          affiliate={selectedAffiliate}
          onClose={() => {
            setShowViewPopup(false);
            setSelectedAffiliate(null);
          }}
        />
      )}

      {/* Popup para Editar */}
      {showEditPopup && selectedAffiliate && (
        <EditAffiliatePopup
          affiliate={selectedAffiliate}
          onClose={() => {
            setShowEditPopup(false);
            setSelectedAffiliate(null);
          }}
          onSave={handleSaveEdit}
        />
      )}

      {/* Modal de confirmación de baja */}
      {showDeleteDialog && selectedAffiliate && (
        <ConfirmDeleteDialog
          open={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedAffiliate(null);
          }}
          onConfirm={handleConfirmDelete}
          affiliateName={selectedAffiliate.nombre}
          affiliateSurname={selectedAffiliate.apellido}
          affiliateDni={selectedAffiliate.dni}
          affiliateCredencial={selectedAffiliate.credencial}
        />
      )}
    </div>
  );
}