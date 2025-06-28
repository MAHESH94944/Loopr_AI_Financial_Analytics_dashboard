import React from "react";
import { Box, CircularProgress } from "@mui/material";

interface LoadingFallbackProps {
  size?: number;
  height?: string;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  size = 40,
  height = "50vh",
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height,
      }}
    >
      <CircularProgress size={size} />
    </Box>
  );
};

export default LoadingFallback;
