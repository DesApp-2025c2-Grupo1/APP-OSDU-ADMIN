import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, apiFetch } from "../config/api";

interface ScheduledAffiliate {
    dni: string;
    nombre: string;
    apellido: string;
    fecha_alta: string;
}

export default function ScheduledAffiliates() {
    const navigate = useNavigate();
    const [affiliates, setAffiliates] = useState<ScheduledAffiliate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchScheduledAffiliates();
    }, []);

    const fetchScheduledAffiliates = async () => {
        try {
            setLoading(true);
            const response = await apiFetch(`${API_BASE_URL}/affiliates/scheduled`);

            if (!response.ok) {
                throw new Error('Error al cargar afiliados programados');
            }

            const data = await response.json();
            setAffiliates(data.affiliates || []);
        } catch (err: any) {
            setError(err.message || 'Error al cargar afiliados programados');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-AR', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'America/Argentina/Buenos_Aires'
        }).format(date);
    };

    return (
        <div className="bg-white rounded-lg w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto p-6 mx-auto mt-6 shadow">
            <div className="flex flex-col items-center sm:items-start mb-6 gap-4">
                <h1 className="text-2xl font-semibold text-gray-800 text-center sm:text-left">
                    Afiliados Programados
                </h1>

                <button
                    onClick={() => navigate("/home")}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                    Volver
                </button>
            </div>

            {loading && (
                <div className="text-center py-8">
                    <p className="text-gray-600">Cargando afiliados programados...</p>
                </div>
            )}

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-center">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {!loading && !error && affiliates.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-600">No hay afiliados programados</p>
                </div>
            )}

            {!loading && !error && affiliates.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead className="bg-[#14B8A6] text-white">
                            <tr>
                                <th className="border border-gray-300 px-4 py-2 text-left">DNI</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Nombre</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Apellido</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Fecha de Alta</th>
                            </tr>
                        </thead>
                        <tbody>
                            {affiliates.map((affiliate) => (
                                <tr key={affiliate.dni} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2">{affiliate.dni}</td>
                                    <td className="border border-gray-300 px-4 py-2">{affiliate.nombre}</td>
                                    <td className="border border-gray-300 px-4 py-2">{affiliate.apellido}</td>
                                    <td className="border border-gray-300 px-4 py-2">{formatDate(affiliate.fecha_alta)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
