// src/data/affiliates.ts
import type { Affiliate } from "../components/AffiliatesTable";

export const affiliates: Affiliate[] = [
  { credencial: "0000001-01", dni: "12345678", nombre: "Joaquin", apellido: "Mogno", fechaNacimiento: "16/12/2002", plan: "210", direccion: "Calle Falsa 123" },
  { credencial: "0000001-02", dni: "23456789", nombre: "Juan", apellido: "Perez", fechaNacimiento: "10/05/2019", plan: "210", direccion: "Av. Vergara 742" },
  { credencial: "0000001-03", dni: "34567891", nombre: "Maria", apellido: "Mogno", fechaNacimiento: "22/07/2005", plan: "210", direccion: "Calle Falsa 123" },
  { credencial: "0000001-04", dni: "45678912", nombre: "Ana", apellido: "Lopez", fechaNacimiento: "05/09/1980", plan: "210", direccion: "Calle Falsa 123" },
  { credencial: "0000001-05", dni: "56789123", nombre: "Carlos", apellido: "Mogno", fechaNacimiento: "30/03/1978", plan: "210", direccion: "Calle Falsa 123" },

  // Grupo Familiar 0000002
  { credencial: "0000002-01", dni: "67891234", nombre: "Pedro", apellido: "Gomez", fechaNacimiento: "15/11/1975", plan: "310", direccion: "Calle Ejemplo 456" },
  { credencial: "0000002-02", dni: "78912345", nombre: "Lucia", apellido: "Gomez", fechaNacimiento: "09/01/1977", plan: "310", direccion: "Calle Ejemplo 456" },
  { credencial: "0000002-03", dni: "89123456", nombre: "Sofia", apellido: "Gomez", fechaNacimiento: "03/06/2003", plan: "310", direccion: "Calle Ejemplo 456" },
  { credencial: "0000002-04", dni: "91234567", nombre: "Diego", apellido: "Gomez", fechaNacimiento: "25/12/2006", plan: "310", direccion: "Calle Ejemplo 456" },
  { credencial: "0000002-05", dni: "11223344", nombre: "Valentina", apellido: "Gomez", fechaNacimiento: "14/08/2011", plan: "310", direccion: "Calle Ejemplo 456" },

  // Grupo Familiar 0000003
  { credencial: "0000003-01", dni: "22334455", nombre: "Martina", apellido: "Lopez", fechaNacimiento: "19/02/1985", plan: "410", direccion: "Av. Siempre Viva 123" },
  { credencial: "0000003-02", dni: "33445566", nombre: "Federico", apellido: "Lopez", fechaNacimiento: "27/07/1983", plan: "410", direccion: "Av. Siempre Viva 123" },
  { credencial: "0000003-03", dni: "44556677", nombre: "Camila", apellido: "Lopez", fechaNacimiento: "05/10/2010", plan: "410", direccion: "Av. Siempre Viva 123" },
  { credencial: "0000003-04", dni: "55667788", nombre: "Mateo", apellido: "Lopez", fechaNacimiento: "18/04/2014", plan: "410", direccion: "Av. Siempre Viva 123" },
  { credencial: "0000003-05", dni: "66778899", nombre: "Agustin", apellido: "Lopez", fechaNacimiento: "11/03/2018", plan: "410", direccion: "Av. Siempre Viva 123" },

  // Grupo Familiar 0000004
  { credencial: "0000004-01", dni: "77889900", nombre: "Sergio", apellido: "Fernandez", fechaNacimiento: "12/05/1970", plan: "210", direccion: "Calle Principal 789" },
  { credencial: "0000004-02", dni: "88990011", nombre: "Paula", apellido: "Fernandez", fechaNacimiento: "21/08/1972", plan: "210", direccion: "Calle Principal 789" },
  { credencial: "0000004-03", dni: "99001122", nombre: "Ignacio", apellido: "Fernandez", fechaNacimiento: "17/06/2000", plan: "210", direccion: "Calle Principal 789" },
  { credencial: "0000004-04", dni: "10111213", nombre: "Florencia", apellido: "Fernandez", fechaNacimiento: "09/09/2005", plan: "210", direccion: "Calle Principal 789" },
  { credencial: "0000004-05", dni: "11121314", nombre: "Lucas", apellido: "Fernandez", fechaNacimiento: "01/01/2012", plan: "210", direccion: "Calle Principal 789" },

  // Grupo Familiar 0000005
  { credencial: "0000005-01", dni: "12131415", nombre: "Gabriel", apellido: "Rodriguez", fechaNacimiento: "04/04/1965", plan: "310", direccion: "Calle Norte 321" },
  { credencial: "0000005-02", dni: "13141516", nombre: "Carolina", apellido: "Rodriguez", fechaNacimiento: "02/02/1967", plan: "310", direccion: "Calle Norte 321" },
  { credencial: "0000005-03", dni: "14151617", nombre: "Martín", apellido: "Rodriguez", fechaNacimiento: "20/07/1995", plan: "310", direccion: "Calle Norte 321" },
  { credencial: "0000005-04", dni: "15161718", nombre: "Julieta", apellido: "Rodriguez", fechaNacimiento: "29/12/2000", plan: "310", direccion: "Calle Norte 321" },
  { credencial: "0000005-05", dni: "16171819", nombre: "Emilia", apellido: "Rodriguez", fechaNacimiento: "07/07/2010", plan: "310", direccion: "Calle Norte 321" },

  // Grupo Familiar 0000006
  { credencial: "0000006-01", dni: "17181920", nombre: "Ricardo", apellido: "Martinez", fechaNacimiento: "03/03/1978", plan: "410", direccion: "Calle Sur 654" },
  { credencial: "0000006-02", dni: "18192021", nombre: "Laura", apellido: "Martinez", fechaNacimiento: "22/11/1980", plan: "410", direccion: "Calle Sur 654" },
  { credencial: "0000006-03", dni: "19202122", nombre: "Franco", apellido: "Martinez", fechaNacimiento: "15/09/2008", plan: "410", direccion: "Calle Sur 654" },
  { credencial: "0000006-04", dni: "20212223", nombre: "Victoria", apellido: "Martinez", fechaNacimiento: "12/10/2012", plan: "410", direccion: "Calle Sur 654" },
  { credencial: "0000006-05", dni: "21222324", nombre: "Pablo", apellido: "Martinez", fechaNacimiento: "30/01/2016", plan: "410", direccion: "Calle Sur 654" },

  // Grupo Familiar 0000007
  { credencial: "0000007-01", dni: "22232425", nombre: "Hernan", apellido: "Alvarez", fechaNacimiento: "06/06/1982", plan: "210", direccion: "Calle Oeste 987" },
  { credencial: "0000007-02", dni: "23242526", nombre: "Marta", apellido: "Alvarez", fechaNacimiento: "16/08/1984", plan: "210", direccion: "Calle Oeste 987" },
  { credencial: "0000007-03", dni: "24252627", nombre: "Tomás", apellido: "Alvarez", fechaNacimiento: "02/02/2012", plan: "210", direccion: "Calle Oeste 987" },
  { credencial: "0000007-04", dni: "25262728", nombre: "Cecilia", apellido: "Alvarez", fechaNacimiento: "09/09/2015", plan: "210", direccion: "Calle Oeste 987" },
  { credencial: "0000007-05", dni: "26272829", nombre: "Diego", apellido: "Alvarez", fechaNacimiento: "11/11/2018", plan: "210", direccion: "Calle Oeste 987" },

  // Grupo Familiar 0000008
  { credencial: "0000008-01", dni: "27282930", nombre: "Oscar", apellido: "Diaz", fechaNacimiento: "23/03/1970", plan: "310", direccion: "Av. Libertad 456" },
  { credencial: "0000008-02", dni: "28293031", nombre: "Patricia", apellido: "Diaz", fechaNacimiento: "14/07/1972", plan: "310", direccion: "Av. Libertad 456" },
  { credencial: "0000008-03", dni: "29303132", nombre: "Santiago", apellido: "Diaz", fechaNacimiento: "08/08/2000", plan: "310", direccion: "Av. Libertad 456" },
  { credencial: "0000008-04", dni: "30313233", nombre: "Valeria", apellido: "Diaz", fechaNacimiento: "19/10/2004", plan: "310", direccion: "Av. Libertad 456" },
  { credencial: "0000008-05", dni: "31323334", nombre: "Ramiro", apellido: "Diaz", fechaNacimiento: "25/12/2012", plan: "310", direccion: "Av. Libertad 456" },

  // Grupo Familiar 0000009
  { credencial: "0000009-01", dni: "32333435", nombre: "Nicolas", apellido: "Torres", fechaNacimiento: "13/04/1988", plan: "410", direccion: "Calle Este 159" },
  { credencial: "0000009-02", dni: "33343536", nombre: "Daniela", apellido: "Torres", fechaNacimiento: "20/06/1990", plan: "410", direccion: "Calle Este 159" },
  { credencial: "0000009-03", dni: "34353637", nombre: "Benjamin", apellido: "Torres", fechaNacimiento: "07/01/2015", plan: "410", direccion: "Calle Este 159" },
  { credencial: "0000009-04", dni: "35363738", nombre: "Juliana", apellido: "Torres", fechaNacimiento: "29/09/2018", plan: "410", direccion: "Calle Este 159" },
  { credencial: "0000009-05", dni: "36373839", nombre: "Felipe", apellido: "Torres", fechaNacimiento: "01/05/2021", plan: "410", direccion: "Calle Este 159" },

  // Grupo Familiar 0000010
  { credencial: "0000010-01", dni: "37383940", nombre: "Esteban", apellido: "Sanchez", fechaNacimiento: "18/12/1976", plan: "210", direccion: "Calle Nueva 753" },
  { credencial: "0000010-02", dni: "38394041", nombre: "Mariana", apellido: "Sanchez", fechaNacimiento: "27/03/1978", plan: "210", direccion: "Calle Nueva 753" },
  { credencial: "0000010-03", dni: "39404142", nombre: "Lautaro", apellido: "Sanchez", fechaNacimiento: "10/07/2008", plan: "210", direccion: "Calle Nueva 753" },
  { credencial: "0000010-04", dni: "40414243", nombre: "Catalina", apellido: "Sanchez", fechaNacimiento: "22/02/2012", plan: "210", direccion: "Calle Nueva 753" },
  { credencial: "0000010-05", dni: "41424344", nombre: "Manuel", apellido: "Sanchez", fechaNacimiento: "06/11/2016", plan: "210", direccion: "Calle Nueva 753" },
];
