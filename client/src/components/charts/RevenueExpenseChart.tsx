import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";

type ChartData = {
  month: string;
  Revenue: number;
  Expense: number;
};

interface RevenueExpenseChartProps {
  data: ChartData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: "background.paper",
          p: 1,
          borderRadius: 1,
          boxShadow: 2,
        }}
      >
        <Typography variant="subtitle2">{label}</Typography>
        <Typography color="success.main">
          Revenue: ${payload[0].value}
        </Typography>
        <Typography color="error.main">Expense: ${payload[1].value}</Typography>
      </Box>
    );
  }
  return null;
};

const RevenueExpenseChart: React.FC<RevenueExpenseChartProps> = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        width: "100%",
        height: isMobile ? 220 : 340,
        bgcolor: "background.paper",
        borderRadius: 3,
        boxShadow: 3,
        p: 2,
        my: 3,
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: 8 },
      }}
    >
      <Typography
        variant="h6"
        fontWeight={700}
        mb={2}
        textAlign="center"
        letterSpacing={1}
      >
        Revenue vs Expenses (Monthly)
      </Typography>
      <ResponsiveContainer width="100%" height={isMobile ? 140 : 260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={theme.palette.success.main}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={theme.palette.success.main}
                stopOpacity={0.1}
              />
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={theme.palette.error.main}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={theme.palette.error.main}
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(v) => `$${v}`} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip
            content={<CustomTooltip />}
            wrapperStyle={{ borderRadius: 8, boxShadow: theme.shadows[3] }}
          />
          <Legend iconType="circle" />
          <Area
            type="monotone"
            dataKey="Revenue"
            stroke={theme.palette.success.main}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            name="Revenue"
          />
          <Area
            type="monotone"
            dataKey="Expense"
            stroke={theme.palette.error.main}
            fillOpacity={1}
            fill="url(#colorExpense)"
            name="Expense"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default RevenueExpenseChart;
