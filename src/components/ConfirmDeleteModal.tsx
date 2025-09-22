import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";

type ConfirmDeleteProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  afiliado: { nombre: string; apellido: string; dni: string };
};

export const ConfirmDeleteModal: React.FC<ConfirmDeleteProps> = ({ open, onClose, onConfirm, afiliado }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ textAlign: "center" }}>
        <span style={{ color: "red", fontSize: 40 }}>!</span>
      </DialogTitle>
      <DialogContent>
        <Typography align="center">
          ¿Está seguro que desea dar de baja al afiliado <br />
          <strong>{afiliado.nombre}, {afiliado.apellido}, DNI {afiliado.dni}</strong>?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", gap: 2 }}>
        <Button variant="contained" color="error" onClick={onClose}>
          NO, CANCELAR
        </Button>
        <Button variant="contained" color="success" onClick={onConfirm}>
          SI, ELIMINAR
        </Button>
      </DialogActions>
    </Dialog>
  );
};
