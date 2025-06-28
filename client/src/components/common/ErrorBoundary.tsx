import React from "react";
import { Box, Typography, Button, Alert } from "@mui/material";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, maxWidth: 400, mx: "auto", mt: 8 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6">Something went wrong.</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {this.state.error?.message || "An unexpected error occurred."}
            </Typography>
          </Alert>
          <Button variant="contained" onClick={this.handleRetry} fullWidth>
            Retry
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
