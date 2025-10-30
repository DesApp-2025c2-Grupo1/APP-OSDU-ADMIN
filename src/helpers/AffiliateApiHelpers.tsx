// Mapeo de planes a IDs numéricos
export const PLAN_MAP: Record<string, number> = {
    "210": 1,
    "310": 2,
    "410": 3,
    "510": 4,
    "Bronce": 5,
    "Plata": 6,
    "Oro": 7,
    "Platino": 8,
};

// Mapeo de situaciones a IDs
export const SITUACION_MAP: Record<string, number> = {
    "Terapia psicológica individual": 1,
    "Terapia familiar": 2,
    "Rehabilitación motriz": 3,
    "Fonoaudiología": 4,
    "Psicopedagogía": 5,
    "Acompañamiento terapéutico": 6,
    "Estimulación temprana": 7,
    "Orientación vocacional": 8,
    "Musicoterapia": 9,
    "Apoyo escolar terapéutico": 10,
    "Evaluación neuropsicológica": 11,
    "Seguimiento clínico integral": 12,
    "Reeducación postural": 13,
    "Programa de reinserción social": 14,
    "Atención domiciliaria": 15,
    "Orientación a cuidadores": 16,
    "Contención emocional": 17,
    "Reeducación del lenguaje": 18,
    "Rehabilitación neurológica": 19,
    "Intervención en crisis": 20,
    "Acompañamiento escolar": 21,
    "Evaluación psicodiagnóstica": 22,
    "Capacitación en habilidades sociales": 23,
    "Taller de manejo de la ansiedad": 24,
    "Orientación laboral": 25,
    "Apoyo postoperatorio": 26,
    "Evaluación de desarrollo infantil": 27,
    "Reeducación auditiva": 28,
    "Plan de rehabilitación cognitiva": 29,
    "Programa de inclusión educativa": 30,
    "Trastorno del espectro autista": 31,
    "Dislexia": 32,
    "Déficit de atención e hiperactividad": 33,
    "Trastorno de ansiedad generalizada": 34,
    "Depresión mayor": 35,
    "Trastorno obsesivo-compulsivo": 36,
    "Esquizofrenia": 37,
    "Parálisis cerebral infantil": 38,
    "Lesión medular": 39,
    "Síndrome de Down": 40,
    "Epilepsia": 41,
    "Demencia senil": 42,
    "Alzheimer": 43,
    "Trastorno bipolar": 44,
    "Fibromialgia": 45,
    "Autonomía asistida": 46,
    "Cuidados paliativos": 47,
    "Rehabilitación cardíaca": 48,
    "Programa de control de diabetes": 49,
    "Tratamiento de adicciones": 50,
    "Apoyo psicológico postraumático": 51,
    "Rehabilitación respiratoria": 52,
    "Acompañamiento en duelo": 53,
};


// Convierte fecha de input (yyyy-mm-dd) a ISO string con hora
export function dateToISO(dateString: string): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString();
}

// Convierte array de strings a array de objetos {email: string}
export function mapEmails(email1?: string, email2?: string): Array<{ email: string }> {
    const emails = [];
    if (email1?.trim()) emails.push({ email: email1.trim() });
    if (email2?.trim()) emails.push({ email: email2.trim() });
    return emails;
}

// Convierte array de strings a array de objetos {telefono: string}
export function mapTelefonos(tel1?: string, tel2?: string): Array<{ telefono: string }> {
    const telefonos = [];
    if (tel1?.trim()) telefonos.push({ telefono: tel1.trim() });
    if (tel2?.trim()) telefonos.push({ telefono: tel2.trim() });
    return telefonos;
}

// Mapea situaciones del formulario a formato API
export function mapSituaciones(
    situaciones: Array<{ situacion: string; fechaFinalizacion: string }>
): Array<{ idSituacionFK: number; fechaInicio: string; fechaFin?: string }> {
    return situaciones
        .filter(s => s.situacion) // Solo las que tienen situación seleccionada
        .map(s => {
            const mapped: any = {
                idSituacionFK: SITUACION_MAP[s.situacion] || 9,
                fechaInicio: new Date().toISOString(), // Fecha actual como inicio
            };

            // Solo agregar fechaFin si existe
            if (s.fechaFinalizacion) {
                mapped.fechaFin = dateToISO(s.fechaFinalizacion);
            }

            return mapped;
        });
}