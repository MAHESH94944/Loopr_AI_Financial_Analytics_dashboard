import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useAuthStore } from "../../store/useAuthStore";
import type { AuthState } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const login = useAuthStore((state: AuthState) => state.login);
  const navigate = useNavigate();

  const validate = (): string | null => {
    if (!email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/))
      return "Invalid email format";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const errorResponse = err as {
          response?: { data?: { message?: string } };
        };
        setError(errorResponse.response?.data?.message || "Login failed");
      } else if (err && typeof err === "object" && "message" in err) {
        const errorMessage = err as { message: string };
        setError(errorMessage.message);
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: 350,
        mx: "auto",
        mt: 8,
        p: 4,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h5" fontWeight={700} textAlign="center">
        Login
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        fullWidth
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : "Login"}
      </Button>
    </Box>
  );
};

export default LoginForm;
