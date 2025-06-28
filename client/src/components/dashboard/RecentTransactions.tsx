import React, { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Chip,
  Box,
  CircularProgress,
  ListItemButton,
  Divider,
  Tooltip,
} from "@mui/material";
import api from "../../services/api";

type Transaction = {
  _id: string;
  user_profile: string;
  user_id: string;
  amount: number;
  category: "Revenue" | "Expense";
  status: "Paid" | "Pending";
  date: string;
};

const statusColor = (status: string) =>
  status === "Paid" ? "success" : "warning";

const amountColor = (category: string) =>
  category === "Revenue" ? "success.main" : "error.main";

const RecentTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/transactions", {
        params: { limit: 3, sortBy: "date", sortOrder: "desc" },
      })
      .then((res) => setTransactions(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 3,
        boxShadow: 3,
        p: 2,
        maxWidth: 500,
        mx: "auto",
        my: 3,
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: 6 },
      }}
    >
      <Typography
        variant="h6"
        fontWeight={700}
        mb={2}
        textAlign="center"
        letterSpacing={1}
      >
        Recent Transactions
      </Typography>
      <List>
        {transactions.map((tx, idx) => (
          <React.Fragment key={tx._id}>
            <ListItem disablePadding sx={{ borderRadius: 2, mb: 1 }}>
              <ListItemButton
                onClick={() =>
                  (window.location.href = `/transactions/${tx._id}`)
                }
                sx={{
                  borderRadius: 2,
                  transition: "background 0.2s",
                  "&:hover": { bgcolor: "action.hover" },
                  py: 1.5,
                  px: 2,
                  gap: 2,
                }}
              >
                <ListItemAvatar>
                  <Tooltip title={tx.user_id}>
                    <Avatar
                      src={tx.user_profile}
                      alt={tx.user_id}
                      sx={{
                        width: 44,
                        height: 44,
                        boxShadow: 1,
                      }}
                    />
                  </Tooltip>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography fontWeight={600} noWrap sx={{ maxWidth: 100 }}>
                      {tx.user_id}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: 13 }}
                    >
                      {new Date(tx.date).toLocaleDateString()}
                    </Typography>
                  }
                  sx={{ minWidth: 0, mr: 2 }}
                />
                <Typography
                  fontWeight={700}
                  color={amountColor(tx.category)}
                  sx={{
                    minWidth: 80,
                    textAlign: "right",
                    fontSize: 17,
                    letterSpacing: 0.5,
                  }}
                >
                  {tx.category === "Revenue" ? "+" : "-"}${tx.amount}
                </Typography>
                <Chip
                  label={tx.status}
                  color={statusColor(tx.status)}
                  size="small"
                  sx={{
                    ml: 2,
                    textTransform: "capitalize",
                    fontWeight: 600,
                    fontSize: 13,
                    px: 1.5,
                  }}
                  variant={tx.status === "Paid" ? "filled" : "outlined"}
                />
              </ListItemButton>
            </ListItem>
            {idx < transactions.length - 1 && (
              <Divider variant="inset" component="li" sx={{ ml: 7 }} />
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default RecentTransactions;
