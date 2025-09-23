import React from "react";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  affiliateName: string;
  affiliateSurname: string;
  affiliateDni: string;
}

export function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  affiliateName,
  affiliateSurname,
  affiliateDni,
}: ConfirmDeleteDialogProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "400px",
          textAlign: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ fontSize: "40px", color: "red" }}>⚠️</div>
        <p style={{ fontSize: "16px", margin: "20px 0" }}>
          ¿Está seguro que desea dar de baja al afiliado <br />
          <b>
            {affiliateName} {affiliateSurname}, DNI {affiliateDni}
          </b>
          ?
        </p>
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: "20px" }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "red",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            NO, CANCELAR
          </button>
          <button
            onClick={onConfirm}
            style={{
              backgroundColor: "green",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            SÍ, ELIMINAR
          </button>
        </div>
      </div>
    </div>
  );
}
