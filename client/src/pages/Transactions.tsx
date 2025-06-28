import React, { useEffect, useState, useCallback, Suspense, lazy } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  Stack,
  useMediaQuery,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import type {
  GridColDef,
  GridRenderCellParams,
  GridSortModel,
} from "@mui/x-data-grid/models";

import {
  SaveAlt,
  Edit,
  Delete,
  ArrowDownward,
  ArrowUpward,
} from "@mui/icons-material";
import api from "../services/api";
import LoadingFallback from "../components/common/LoadingFallback";

// Lazy load search component
const TransactionSearch = lazy(
  () => import("../components/transactions/TransactionSearch")
);

type Transaction = {
  _id: string;
  date: string;
  amount: number;
  category: "Revenue" | "Expense";
  status: "Paid" | "Pending";
  user_id: string;
  user_profile: string;
};

const categories = ["Revenue", "Expense"];
const statuses = ["Paid", "Pending"];

const Transactions: React.FC = () => {
  const [rows, setRows] = useState<Transaction[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "date", sort: "desc" },
  ]);
  const [category, setCategory] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [amountMin, setAmountMin] = useState<string>("");
  const [amountMax, setAmountMax] = useState<string>("");
  const [user, setUser] = useState<string>("");
  const isMobile = useMediaQuery("(max-width:600px)");

  const fetchData = useCallback(async () => {
    const params = {
      page: page + 1,
      limit: pageSize,
      sortBy: sortModel[0]?.field,
      sortOrder: sortModel[0]?.sort,
      category,
      status,
      dateFrom,
      dateTo,
      amountMin,
      amountMax,
      user,
      search,
    };

    const res = await api.get("/transactions", { params });
    setRows(res.data.transactions || res.data);
    setRowCount(res.data.total || res.data.length);
  }, [
    page,
    pageSize,
    sortModel,
    category,
    status,
    dateFrom,
    dateTo,
    amountMin,
    amountMax,
    user,
    search,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async () => {
    const columns = [
      "date",
      "amount",
      "category",
      "status",
      "user_id",
      "user_profile",
    ];
    const res = await api.post(
      "/transactions/export-csv",
      { columns },
      { responseType: "blob" }
    );
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transactions_export.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleEdit = (id: string) => {
    window.location.href = `/transactions/${id}/edit`;
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this transaction?")) {
      await api.delete(`/transactions/${id}`);
      fetchData();
    }
  };

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      sortable: true,
      renderHeader: (params) => (
        <span>
          Date
          {sortModel[0]?.field === "date" &&
            (sortModel[0]?.sort === "asc" ? (
              <ArrowUpward
                fontSize="small"
                sx={{ verticalAlign: "middle", ml: 0.5 }}
              />
            ) : (
              <ArrowDownward
                fontSize="small"
                sx={{ verticalAlign: "middle", ml: 0.5 }}
              />
            ))}
        </span>
      ),
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "amount",
      headerName: "Amount",
      flex: 1,
      sortable: true,
      renderHeader: (params) => (
        <span>
          Amount
          {sortModel[0]?.field === "amount" &&
            (sortModel[0]?.sort === "asc" ? (
              <ArrowUpward
                fontSize="small"
                sx={{ verticalAlign: "middle", ml: 0.5 }}
              />
            ) : (
              <ArrowDownward
                fontSize="small"
                sx={{ verticalAlign: "middle", ml: 0.5 }}
              />
            ))}
        </span>
      ),
      renderCell: (params: GridRenderCellParams<Transaction>) => (
        <Typography
          color={
            params.row.category === "Revenue" ? "success.main" : "error.main"
          }
        >
          {params.row.category === "Revenue" ? "+" : "-"}${params.value}
        </Typography>
      ),
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      sortable: true,
      renderHeader: (params) => (
        <span>
          Category
          {sortModel[0]?.field === "category" &&
            (sortModel[0]?.sort === "asc" ? (
              <ArrowUpward
                fontSize="small"
                sx={{ verticalAlign: "middle", ml: 0.5 }}
              />
            ) : (
              <ArrowDownward
                fontSize="small"
                sx={{ verticalAlign: "middle", ml: 0.5 }}
              />
            ))}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      sortable: true,
      renderHeader: (params) => (
        <span>
          Status
          {sortModel[0]?.field === "status" &&
            (sortModel[0]?.sort === "asc" ? (
              <ArrowUpward
                fontSize="small"
                sx={{ verticalAlign: "middle", ml: 0.5 }}
              />
            ) : (
              <ArrowDownward
                fontSize="small"
                sx={{ verticalAlign: "middle", ml: 0.5 }}
              />
            ))}
        </span>
      ),
      renderCell: (params: GridRenderCellParams<string>) => (
        <Typography
          color={params.value === "Paid" ? "success.main" : "warning.main"}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "user_id",
      headerName: "User",
      flex: 1,
      sortable: true,
      renderHeader: (params) => (
        <span>
          User
          {sortModel[0]?.field === "user_id" &&
            (sortModel[0]?.sort === "asc" ? (
              <ArrowUpward
                fontSize="small"
                sx={{ verticalAlign: "middle", ml: 0.5 }}
              />
            ) : (
              <ArrowDownward
                fontSize="small"
                sx={{ verticalAlign: "middle", ml: 0.5 }}
              />
            ))}
        </span>
      ),
    },
    {
      field: "user_profile",
      headerName: "Avatar",
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <img
          src={params.value}
          alt={params.row.user_id}
          style={{ width: 32, height: 32, borderRadius: "50%" }}
        />
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<any, Transaction>) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            color="primary"
            startIcon={<Edit />}
            onClick={() => handleEdit(params.row._id)}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            startIcon={<Delete />}
            onClick={() => handleDelete(params.row._id)}
          >
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Transactions
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Suspense fallback={<LoadingFallback size={20} height="60px" />}>
          <TransactionSearch
            value={search}
            onChange={setSearch}
            placeholder="Search all fields..."
          />
        </Suspense>
      </Box>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
        <TextField
          label="Date From"
          type="date"
          size="small"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Date To"
          type="date"
          size="small"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Min Amount"
          type="number"
          size="small"
          value={amountMin}
          onChange={(e) => setAmountMin(e.target.value)}
        />
        <TextField
          label="Max Amount"
          type="number"
          size="small"
          value={amountMax}
          onChange={(e) => setAmountMax(e.target.value)}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Category</InputLabel>
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {statuses.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="User"
          size="small"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <Button
          variant="outlined"
          startIcon={<SaveAlt />}
          onClick={handleExport}
        >
          Export CSV
        </Button>
      </Stack>

      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: 3,
          p: { xs: 1, md: 2 },
          my: 2,
          transition: "box-shadow 0.2s",
          "&:hover": { boxShadow: 8 },
        }}
      >
        {isMobile ? (
          <Box>
            {rows.map((row) => (
              <Card key={row._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <img
                      src={row.user_profile}
                      alt={row.user_id}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        marginRight: 8,
                      }}
                    />
                    <Typography variant="body2">{row.user_id}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2">
                      {`${new Date(row.date).toLocaleDateString()} | ${
                        row.category
                      } | `}
                    </Typography>
                    <Chip
                      label={row.status}
                      color={row.status === "Paid" ? "success" : "warning"}
                      size="small"
                      sx={{ ml: 1, textTransform: "capitalize" }}
                    />
                  </Box>
                  <Typography
                    fontWeight={700}
                    color={
                      row.category === "Revenue" ? "success.main" : "error.main"
                    }
                  >
                    {row.category === "Revenue" ? "+" : "-"}${row.amount}
                  </Typography>
                  <Box display="flex" justifyContent="flex-end" mt={1}>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleEdit(row._id)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(row._id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
            getRowId={(row) => row._id}
            rowCount={rowCount}
            page={page}
            pageSize={pageSize}
            pageSizeOptions={[5, 10, 20, 50, 100]}
            pagination
            paginationMode="server"
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            disableSelectionOnClick
            components={{ Toolbar: GridToolbar }}
          />
        )}
      </Box>
    </Box>
  );
};

export default Transactions;
