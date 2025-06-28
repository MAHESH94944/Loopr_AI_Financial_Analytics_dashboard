import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Box, Typography, useTheme } from "@mui/material";

interface CategoryData {
  category: string;
  value: number;
}

interface Props {
  data: CategoryData[];
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#ab47bc",
  "#ef5350",
];

const CategoryBreakdownChart: React.FC<Props> = ({ data }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: "100%",
        height: 320,
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
        Category Breakdown
      </Typography>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((entry, idx) => (
              <Cell key={entry.category} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `$${v}`} />
          <Legend iconType="circle" layout="horizontal" align="center" />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CategoryBreakdownChart;
