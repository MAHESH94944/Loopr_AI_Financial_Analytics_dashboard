import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Paper,
  Typography,
  IconButton,
  ListItemButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import api from "../../services/api";

type Transaction = {
  _id: string;
  user_profile: string;
  user_id: string;
  amount: number;
  category: string;
  status: string;
  date: string;
};

const highlight = (text: string, query: string) => {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: text.replace(regex, "<mark>$1</mark>"),
      }}
    />
  );
};

interface TransactionSearchProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
}

const TransactionSearch: React.FC<TransactionSearchProps> = ({
  value,
  onChange,
  placeholder = "Search transactions...",
}) => {
  const [internalValue, setInternalValue] = useState("");
  const controlled =
    typeof value === "string" && typeof onChange === "function";
  const searchValue = controlled ? value : internalValue;
  const [results, setResults] = useState<Transaction[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!searchValue) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await api.get("/transactions", {
          params: { search: searchValue, limit: 5 },
        });
        setResults(res.data.transactions || res.data);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchValue]);

  const handleClear = () => {
    if (controlled) {
      onChange?.("");
    } else {
      setInternalValue("");
    }
    setResults([]);
    setOpen(false);
  };

  return (
    <Box sx={{ position: "relative", width: 350, maxWidth: "100%" }}>
      <TextField
        fullWidth
        size="small"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => {
          if (controlled) {
            onChange?.(e.target.value);
          } else {
            setInternalValue(e.target.value);
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: searchValue && (
            <InputAdornment position="end">
              <IconButton onClick={handleClear} size="small">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        onFocus={() => searchValue && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && results.length > 0 && (
        <Paper
          sx={{
            position: "absolute",
            width: "100%",
            zIndex: 10,
            mt: 1,
            maxHeight: 320,
            overflowY: "auto",
          }}
          elevation={4}
        >
          <List>
            {results.map((tx) => (
              <ListItem key={tx._id} disablePadding>
                <ListItemButton
                  onMouseDown={() =>
                    (window.location.href = `/transactions/${tx._id}`)
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={tx.user_profile} alt={tx.user_id} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography fontWeight={600}>
                        {highlight(tx.user_id, searchValue)}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          component="span"
                        >
                          {highlight(tx.category, searchValue)} |{" "}
                          {highlight(tx.status, searchValue)} |{" "}
                          {highlight(
                            new Date(tx.date).toLocaleDateString(),
                            searchValue
                          )}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={
                            tx.category === "Revenue"
                              ? "success.main"
                              : "error.main"
                          }
                          component="span"
                          sx={{ ml: 1, fontWeight: 700 }}
                        >
                          {tx.category === "Revenue" ? "+" : "-"}${tx.amount}
                        </Typography>
                      </>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
      {open && !loading && results.length === 0 && (
        <Paper
          sx={{
            position: "absolute",
            width: "100%",
            zIndex: 10,
            mt: 1,
            p: 2,
            textAlign: "center",
          }}
          elevation={4}
        >
          <Typography variant="body2" color="text.secondary">
            No results found
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default TransactionSearch;
