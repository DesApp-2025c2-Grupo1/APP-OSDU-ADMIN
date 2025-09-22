import React, { useState } from "react";
import { Menu, MenuItem, IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

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
  onEdit: (a: Affiliate) => void;
  onViewGroup: (a: Affiliate) => void;
  onDelete: (a: Affiliate) => void;
}

export function AffiliatesTable({
  affiliates,
  onEdit,
  onViewGroup,
  onDelete,
}: AffiliatesTableProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selected, setSelected] = useState<Affiliate | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>, a: Affiliate) => {
    setAnchorEl(event.currentTarget);
    setSelected(a);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelected(null);
  };

  return (
    <>
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
                <IconButton onClick={(e) => handleClick(e, a)}>
                  <MoreVertIcon />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose}>
  <MenuItem
    onClick={() => {
      if (selected) onEdit(selected);
      handleClose();
    }}
  >
    Editar
  </MenuItem>
  <MenuItem
    onClick={() => {
      if (selected) onViewGroup(selected);
      handleClose();
    }}
  >
    Ver Grupo Familiar
  </MenuItem>
  <MenuItem
    onClick={() => {
      if (selected) onDelete(selected);
      handleClose();
    }}
  >
    Dar de Baja
  </MenuItem>
</Menu>
    </>
  );
}
