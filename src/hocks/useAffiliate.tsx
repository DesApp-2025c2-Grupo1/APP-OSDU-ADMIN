import { useState, useEffect } from 'react';
import type { Affiliate } from '../components/AffiliatesTable';

interface AffiliateAPI {
    idGrupoFamiliarFK: number;
    tipoDocumento: string;
    apellido: string;
    credencial: string;
    direccion: string;
    dni: string;
    nombre: string;
    parentesco: string;
    plan: string;
    fecha_nacimiento: string | null;
}

interface AffiliatesResponse {
    affiliates: AffiliateAPI[];
}

export function useAffiliates() {
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAffiliates = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(import.meta.env.BASE_URL + '/affiliates');

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data: AffiliatesResponse = await response.json();

            // Mapear datos de la API al formato del componente
            const mappedAffiliates: Affiliate[] = data.affiliates.map((aff) => ({
                credencial: aff.credencial,
                idGrupoFamiliarFK: aff.idGrupoFamiliarFK,
                dni: aff.dni,
                nombre: aff.nombre,
                apellido: aff.apellido,
                fecha_nacimiento: aff.fecha_nacimiento || 'N/A',
                plan: aff.plan,
                direccion: aff.direccion,
                parentesco: aff.parentesco,
                tipoDocumento: aff.tipoDocumento,
            }));

            setAffiliates(mappedAffiliates);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar afiliados';
            setError(errorMessage);
            console.error('Error fetching affiliates:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAffiliates();
    }, []);

    const refetch = async () => {
        await fetchAffiliates();
    };

    return { affiliates, loading, error, refetch };
}