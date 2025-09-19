import React from "react";

export type Affiliate = {
  credencial: string;
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  plan: string;
  direccion: string;
};

interface AffiliatesTableProps {
  affiliates: Affiliate[];
}

export function AffiliatesTable({ affiliates }: AffiliatesTableProps) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#5FA92C", color: "white" }}>
          <th>Credencial</th>
          <th>DNI</th>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>Fecha De Nac.</th>
          <th>Plan</th>
          <th>Dirección</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {affiliates.map((a) => (
          <tr key={a.credencial}>
            <td>{a.credencial}</td>
            <td>{a.dni}</td>
            <td>{a.nombre}</td>
            <td>{a.apellido}</td>
            <td>{a.fechaNacimiento}</td>
            <td>{a.plan}</td>
            <td>{a.direccion}</td>
            <td>
              <button className="options-btn" title="Opciones">
                &#8942;
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
