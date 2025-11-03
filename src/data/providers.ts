import type { Prestador } from "../model/Provider.model";

export const providersMock: Prestador[] = [
  //Centros Médicos
  {
    id: "centro-italiano",
    cuilCuit: "30-12345678-9",
    nombreCompleto: "Hospital Italiano",
    tipo: "centro",
    especialidades: ["clinica", "cardiologia", "resonancia"],
    integraCentroMedico: null,
    telefonos: ["1140000000", "1140000001"],
    emails: ["contacto@hitaliano.org"],
    direcciones: [
      {
        etiqueta: "Sede Central",
        calle: "Gascón",
        numero: "450",
        localidad: "CABA",
        provincia: "Buenos Aires",
        cp: "1181",
        horarios: [
          { dias: [1, 2, 3, 4, 5], desde: "08:00", hasta: "20:00" },
          { dias: [6], desde: "08:00", hasta: "13:00" },
        ],
      },
    ],
  },
  {
    id: "centro-posadas",
    cuilCuit: "30-22345678-9",
    nombreCompleto: "Hospital Posadas",
    tipo: "centro",
    especialidades: ["clinica", "pediatria", "dermatologia"],
    integraCentroMedico: null,
    telefonos: ["1142000000"],
    emails: ["info@hposadas.org"],
    direcciones: [
      {
        etiqueta: "Sede Central",
        calle: "Presidente Illia",
        numero: "2000",
        localidad: "Haedo",
        provincia: "Buenos Aires",
        cp: "1706",
        horarios: [
          { dias: [1, 2, 3, 4, 5], desde: "07:30", hasta: "19:30" },
        ],
      },
    ],
  },
  {
    id: "centro-fleming",
    cuilCuit: "30-33333333-9",
    nombreCompleto: "Instituto Fleming",
    tipo: "centro",
    especialidades: ["resonancia", "dermatologia", "otorrino"],
    integraCentroMedico: null,
    telefonos: ["1133333333"],
    emails: ["fleming@instituto.com"],
    direcciones: [
      {
        etiqueta: "Sede Palermo",
        calle: "Av. Santa Fe",
        numero: "3500",
        localidad: "CABA",
        provincia: "Buenos Aires",
        cp: "1425",
        horarios: [
          { dias: [1, 3, 5], desde: "09:00", hasta: "18:00" },
        ],
      },
    ],
  },

  // Profesionales Independientes
  {
    id: "prof-favaloro",
    cuilCuit: "21-1780879-3",
    nombreCompleto: "René Favaloro",
    tipo: "profesional",
    especialidades: ["clinica", "cardiologia"],
    integraCentroMedico: null,
    telefonos: ["11474125"],
    emails: ["rfavaloro@ejemplo.com"],
    direcciones: [
      {
        etiqueta: "Consultorio Central",
        calle: "Av. Siempre Viva",
        numero: "742",
        localidad: "CABA",
        provincia: "Buenos Aires",
        cp: "1405",
        horarios: [
          { dias: [1, 2, 3, 4], desde: "08:00", hasta: "13:00" },
          { dias: [1], desde: "15:00", hasta: "19:00", especialidadId: "cardiologia" },
        ],
      },
    ],
  },
  {
    id: "prof-luz",
    cuilCuit: "27-10000004-6",
    nombreCompleto: "Sergio Luz",
    tipo: "profesional",
    especialidades: ["traumatologia"],
    integraCentroMedico: null,
    telefonos: ["1166666666"],
    emails: ["sluz@ejemplo.com"],
    direcciones: [
      {
        etiqueta: "Clínica Oeste",
        calle: "Av. Rivadavia",
        numero: "9999",
        localidad: "Morón",
        provincia: "Buenos Aires",
        cp: "1708",
        horarios: [
          { dias: [2, 4], desde: "09:00", hasta: "15:00" },
        ],
      },
    ],
  },
  {
    id: "prof-vega",
    cuilCuit: "30-10000009-1",
    nombreCompleto: "Carla Vega",
    tipo: "profesional",
    especialidades: ["clinica"],
    integraCentroMedico: null,
    telefonos: ["1188888888"],
    emails: ["cvega@ejemplo.com"],
    direcciones: [
      {
        etiqueta: "Consultorio UBA",
        calle: "Medrano",
        numero: "900",
        localidad: "CABA",
        provincia: "Buenos Aires",
        cp: "1179",
        horarios: [
          { dias: [1, 3, 5], desde: "08:00", hasta: "12:00" },
        ],
      },
    ],
  },
  {
    id: "prof-garcia",
    cuilCuit: "27-10000001-3",
    nombreCompleto: "Ana García",
    tipo: "profesional",
    especialidades: ["clinica"],
    integraCentroMedico: null,
    telefonos: ["1133333333"],
    emails: ["agarcia@ejemplo.com"],
    direcciones: [
      {
        etiqueta: "Sanatorio Central",
        calle: "Alsina",
        numero: "500",
        localidad: "CABA",
        provincia: "Buenos Aires",
        cp: "1088",
        horarios: [
          { dias: [1, 2, 3, 4, 5], desde: "09:00", hasta: "14:00" },
        ],
      },
    ],
  },
  {
    id: "prof-ruiz",
    cuilCuit: "27-10000002-4",
    nombreCompleto: "Luis Pérez",
    tipo: "profesional",
    especialidades: ["cardiologia"],
    integraCentroMedico: null,
    telefonos: ["1122222222"],
    emails: ["lperez@ejemplo.com"],
    direcciones: [
      {
        etiqueta: "Instituto del Corazón",
        calle: "Lavalle",
        numero: "2100",
        localidad: "CABA",
        provincia: "Buenos Aires",
        cp: "1048",
        horarios: [
          { dias: [1, 3, 5], desde: "10:00", hasta: "18:00" },
        ],
      },
    ],
  },

  //Profesionales que integran Centros
  {
    id: "prof-mansilla",
    cuilCuit: "27-10000009-2",
    nombreCompleto: "Carla Mansilla",
    tipo: "profesional",
    especialidades: ["dermatologia"],
    integraCentroMedico: { id: "centro-italiano", nombre: "Hospital Italiano" },
    telefonos: ["1188888888"],
    emails: ["cmansilla@ejemplo.com"],
    direcciones: [
      {
        etiqueta: "Consultorio Derma",
        calle: "Av. Rivadavia",
        numero: "10500",
        localidad: "Haedo",
        provincia: "Buenos Aires",
        cp: "1706",
        horarios: [
          { dias: [2, 4], desde: "10:00", hasta: "16:00" },
        ],
      },
    ],
  },
  {
    id: "prof-suarez",
    cuilCuit: "30-10000006-8",
    nombreCompleto: "Nadia Suárez",
    tipo: "profesional",
    especialidades: ["ginecologia"],
    integraCentroMedico: { id: "centro-posadas", nombre: "Hospital Posadas" },
    telefonos: ["1144444444"],
    emails: ["nsuarez@ejemplo.com"],
    direcciones: [
      {
        etiqueta: "Sede Haedo",
        calle: "Presidente Illia",
        numero: "2000",
        localidad: "Haedo",
        provincia: "Buenos Aires",
        cp: "1706",
        horarios: [
          { dias: [1, 3, 5], desde: "09:00", hasta: "15:00" },
        ],
      },
    ],
  },
  {
    id: "prof-zarate",
    cuilCuit: "30-10000007-9",
    nombreCompleto: "Pablo Zárate",
    tipo: "profesional",
    especialidades: ["oftalmologia"],
    integraCentroMedico: { id: "centro-fleming", nombre: "Instituto Fleming" },
    telefonos: ["1141414141"],
    emails: ["pzarate@ejemplo.com"],
    direcciones: [
      {
        etiqueta: "Consultorio Santa Lucía",
        calle: "Corrientes",
        numero: "4500",
        localidad: "CABA",
        provincia: "Buenos Aires",
        cp: "1414",
        horarios: [
          { dias: [2, 4], desde: "08:00", hasta: "14:00" },
        ],
      },
    ],
  },
];
