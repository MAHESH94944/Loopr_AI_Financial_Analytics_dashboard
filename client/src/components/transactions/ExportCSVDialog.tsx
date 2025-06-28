import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  CircularProgress,
} from "@mui/material";
import api from "../../services/api";

const ALL_COLUMNS = [
  { key: "date", label: "Date" },
  { key: "amount", label: "Amount" },
  { key: "category", label: "Category" },
  { key: "status", label: "Status" },
  { key: "user_id", label: "User" },
  { key: "user_profile", label: "Avatar" },
];

interface ExportCSVDialogProps {
  open: boolean;
  onClose: () => void;
}

const ExportCSVDialog: React.FC<ExportCSVDialogProps> = ({ open, onClose }) => {
  const [selected, setSelected] = useState<string[]>(
    ALL_COLUMNS.map((c) => c.key)
  );
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && selected.length > 0) {
      setLoading(true);
      setError(null);
      api
        .get("/transactions", { params: { limit: 5 } })
        .then((res) => setPreview(res.data.transactions || res.data))
        .catch(() => setError("Failed to load preview"))
        .finally(() => setLoading(false));
    }
  }, [open, selected]);

  const handleToggle = (col: string) => {
    setSelected((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    try {
      const res = await api.post(
        "/transactions/export-csv",
        { columns: selected },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "transactions_export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      onClose();
    } catch (err: any) {
      setError("Export failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Export Transactions as CSV</DialogTitle>
      <DialogContent>
        <Typography mb={2}>Select columns to include:</Typography>
        <FormGroup row sx={{ mb: 2 }}>
          {ALL_COLUMNS.map((col) => (
            <FormControlLabel
              key={col.key}
              control={
                <Checkbox
                  checked={selected.includes(col.key)}
                  onChange={() => handleToggle(col.key)}
                  disabled={downloading}
                />
              }
              label={col.label}
            />
          ))}
        </FormGroup>
        <Typography variant="subtitle2" mb={1}>
          Preview (first 5 rows):
        </Typography>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                {selected.map((col) => (
                  <TableCell key={col}>
                    {ALL_COLUMNS.find((c) => c.key === col)?.label || col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {preview.map((row, i) => (
                <TableRow key={row._id || i}>
                  {selected.map((col) => (
                    <TableCell key={col}>
                      {col === "date"
                        ? row.date
                          ? new Date(row.date).toLocaleDateString()
                          : ""
                        : row[col] ?? ""}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        {error && (
          <Alert severity="error" sx={{ flexGrow: 1 }}>
            {error}
          </Alert>
        )}
        <Button onClick={onClose} disabled={downloading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleDownload}
          disabled={selected.length === 0 || downloading}
        >
          {downloading ? <CircularProgress size={20} /> : "Download CSV"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportCSVDialog;
