import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  activateAffiliate,
  deactivateAffiliate,
  getAffiliates,
  getApiErrorMessage,
} from "../services/PortalAdminService";

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "true", label: "Activos" },
  { value: "false", label: "Pendientes/Inactivos" },
];

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(new Date(value));
}

function fullName(affiliate) {
  return `${affiliate.nombre || ""} ${affiliate.apellido || ""}`.trim() || "-";
}

function AffiliateStatus({ activo }) {
  return activo
    ? <Chip label="Activo" color="success" size="small" />
    : <Chip label="Pendiente" color="warning" size="small" />;
}

export function AffiliatesAdminPage() {
  const [affiliates, setAffiliates] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState("all");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAffiliates = useCallback(async (clearSuccess = true) => {
    setIsLoading(true);
    setError("");
    if (clearSuccess) {
      setSuccessMessage("");
    }

    try {
      setAffiliates(await getAffiliates(filtroActivo));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [filtroActivo]);

  useEffect(() => {
    fetchAffiliates();
  }, [fetchAffiliates]);

  const totals = useMemo(() => ({
    all: affiliates.length,
    active: affiliates.filter((affiliate) => !!affiliate.activo).length,
    inactive: affiliates.filter((affiliate) => !affiliate.activo).length,
  }), [affiliates]);

  const updateStatus = async (affiliate) => {
    setUpdatingId(affiliate.id);
    setError("");
    setSuccessMessage("");

    try {
      const isActivating = !affiliate.activo;
      if (affiliate.activo) {
        await deactivateAffiliate(affiliate.id);
      } else {
        await activateAffiliate(affiliate.id);
      }

      await fetchAffiliates(false);
      setSuccessMessage(isActivating ? "Afiliado aprobado con éxito" : "Afiliado desactivado con éxito");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Afiliados
          </Typography>
          <Typography color="text.secondary">
            Altas, bajas y seguimiento de cuentas del portal
          </Typography>
        </Box>

        <FormControl sx={{ width: { xs: "100%", sm: 220 } }}>
          <InputLabel id="status-filter-label">Estado</InputLabel>
          <Select
            labelId="status-filter-label"
            value={filtroActivo}
            label="Estado"
            onChange={(event) => setFiltroActivo(event.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">Listado</Typography>
          <Typography variant="h5">{totals.all}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">Activos</Typography>
          <Typography variant="h5">{totals.active}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">Pendientes/Inactivos</Typography>
          <Typography variant="h5">{totals.inactive}</Typography>
        </Paper>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}

      <Paper elevation={1}>
        {isLoading ? (
          <Box sx={{ display: "grid", placeItems: "center", minHeight: 280 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Afiliado</TableCell>
                  <TableCell>Credencial</TableCell>
                  <TableCell>Documento</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Alta</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {affiliates.map((affiliate) => (
                  <TableRow key={affiliate.id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>{fullName(affiliate)}</Typography>
                      <Typography variant="body2" color="text.secondary">{affiliate.email}</Typography>
                    </TableCell>
                    <TableCell>{affiliate.credencial}</TableCell>
                    <TableCell>{affiliate.tipoDocumento} {affiliate.nroDocumento || affiliate.dni}</TableCell>
                    <TableCell>{affiliate.plan?.nombre || "-"}</TableCell>
                    <TableCell>{formatDate(affiliate.fechaAlta)}</TableCell>
                    <TableCell><AffiliateStatus activo={affiliate.activo} /></TableCell>
                    <TableCell align="right">
                      <Button
                        variant={affiliate.activo ? "outlined" : "contained"}
                        color={affiliate.activo ? "warning" : "success"}
                        onClick={() => updateStatus(affiliate)}
                        disabled={updatingId === affiliate.id}
                      >
                        {affiliate.activo ? "Desactivar" : "Activar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {affiliates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No hay afiliados para el filtro seleccionado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Stack>
  );
}
