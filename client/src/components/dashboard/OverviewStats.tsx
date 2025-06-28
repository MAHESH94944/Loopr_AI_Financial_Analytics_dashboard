import React from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";

type Stat = {
  value: number;
  month: string;
};

interface OverviewStatsProps {
  stats: Stat[];
}

const getColor = (value: number, theme: any) => {
  if (value >= 900) return theme.palette.success.main;
  if (value >= 500) return theme.palette.primary.main;
  return theme.palette.warning.main;
};

const OverviewStats: React.FC<OverviewStatsProps> = ({ stats }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: isMobile
          ? "1fr"
          : { xs: "repeat(3, 1fr)", md: "repeat(6, 1fr)" },
        gap: 2,
        mb: 4,
      }}
    >
      {stats.map((stat, idx) => (
        <Box
          key={stat.month}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            bgcolor: "background.paper",
            borderRadius: "50%",
            width: { xs: 90, md: 110 },
            height: { xs: 90, md: 110 },
            justifyContent: "center",
            boxShadow: 3,
            mx: "auto",
            transition: "box-shadow 0.2s, transform 0.2s",
            "&:hover": {
              boxShadow: 8,
              transform: "scale(1.06)",
            },
          }}
        >
          <Box
            sx={{
              width: { xs: 65, md: 80 },
              height: { xs: 65, md: 80 },
              borderRadius: "50%",
              bgcolor: getColor(stat.value, theme),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1,
              boxShadow: 2,
              animation: "pulse 1.2s infinite alternate",
              "@keyframes pulse": {
                to: {
                  boxShadow: `0 0 18px 2px ${getColor(stat.value, theme)}44`,
                },
              },
            }}
          >
            <Typography
              variant="h6"
              color="#fff"
              fontWeight={700}
              sx={{ fontSize: { xs: 20, md: 24 } }}
            >
              ${stat.value}
            </Typography>
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500, textTransform: "capitalize", fontSize: 15 }}
          >
            {stat.month}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default OverviewStats;
