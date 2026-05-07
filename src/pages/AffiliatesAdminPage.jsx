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
  return `${affiliate.first_name || ""} ${affiliate.last_name || ""}`.trim() || "-";
}

function AffiliateStatus({ status }) {
  return status
    ? <Chip label="Activo" color="success" size="small" />
    : <Chip label="Pendiente" color="warning" size="small" />;
}

export function AffiliatesAdminPage() {
  const [affiliates, setAffiliates] = useState([]);
  const [status, setStatus] = useState("all");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAffiliates = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setAffiliates(await getAffiliates(status));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchAffiliates();
  }, [fetchAffiliates]);

  const totals = useMemo(() => ({
    all: affiliates.length,
    active: affiliates.filter((affiliate) => !!affiliate.status).length,
    inactive: affiliates.filter((affiliate) => !affiliate.status).length,
  }), [affiliates]);

  const updateStatus = async (affiliate) => {
    setUpdatingId(affiliate.id);
    setError("");

    try {
      if (affiliate.status) {
        await deactivateAffiliate(affiliate.id);
      } else {
        await activateAffiliate(affiliate.id);
      }

      await fetchAffiliates();
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
            value={status}
            label="Estado"
            onChange={(event) => setStatus(event.target.value)}
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
                    <TableCell>{affiliate.credencial_number}</TableCell>
                    <TableCell>{affiliate.document_type} {affiliate.document_number}</TableCell>
                    <TableCell>{affiliate.plan_type || affiliate.plan_code || "-"}</TableCell>
                    <TableCell>{formatDate(affiliate.created_at)}</TableCell>
                    <TableCell><AffiliateStatus status={affiliate.status} /></TableCell>
                    <TableCell align="right">
                      <Button
                        variant={affiliate.status ? "outlined" : "contained"}
                        color={affiliate.status ? "warning" : "success"}
                        onClick={() => updateStatus(affiliate)}
                        disabled={updatingId === affiliate.id}
                      >
                        {affiliate.status ? "Desactivar" : "Activar"}
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
