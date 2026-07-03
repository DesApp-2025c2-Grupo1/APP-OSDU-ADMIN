import React, { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";

interface OptionsMenuProps {
  affiliate: {
    credencial: string;
    dni: string;
    nombre: string;
    apellido: string;
    tipoDocumento?: string;
    nroDocumento?: string;
  };
  onOptionClick: (option: string, affiliate: any) => void;
  options: string[];
}

export function OptionsMenu({ affiliate, onOptionClick, options }: OptionsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOptionSelect = (option: string) => {
    onOptionClick(option, affiliate);
    handleClose();
  };

  return (
    <div style={{ display: "inline-block" }}>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          color: "text.secondary",
          fontSize: "1.25rem",
          padding: "4px 8px",
          borderRadius: "4px",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        }}
        title="Opciones"
      >
        &#8942;
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            minWidth: "160px",
          }
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option}
            onClick={() => handleOptionSelect(option)}
            sx={{
              fontSize: "0.875rem",
              color: "#334155",
              py: 1,
              px: 2,
              "&:hover": {
                backgroundColor: "#f1f5f9",
              },
            }}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

