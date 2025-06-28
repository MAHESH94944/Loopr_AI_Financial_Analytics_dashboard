import React, { useEffect, useState, Suspense, lazy } from "react";
import api from "../services/api";
import LoadingFallback from "../components/common/LoadingFallback";

// Lazy load chart components for better performance
const OverviewStats = lazy(
  () => import("../components/dashboard/OverviewStats")
);
const RevenueExpenseChart = lazy(
  () => import("../components/charts/RevenueExpenseChart")
);
const CategoryBreakdownChart = lazy(
  () => import("../components/charts/CategoryBreakdownChart")
);
const RecentTransactions = lazy(
  () => import("../components/dashboard/RecentTransactions")
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<{
    totalRevenue: number;
    totalExpense: number;
    net: number;
  } | null>(null);
  const [trends, setTrends] = useState<
    Array<{ month: string; Revenue: number; Expense: number }>
  >([]);
  const [categoryData, setCategoryData] = useState<
    Array<{ category: string; value: number }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/transactions/summary"),
      api.get("/transactions/trends"),
      api.get("/transactions/category-breakdown"),
    ])
      .then(([summaryRes, trendsRes, catRes]) => {
        setStats(summaryRes.data);
        setTrends(trendsRes.data);
        setCategoryData(catRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingFallback />;

  // OverviewStats expects an array with month property
  const overviewStats = [
    { month: "Total Revenue", value: stats?.totalRevenue ?? 0 },
    { month: "Total Expense", value: stats?.totalExpense ?? 0 },
    { month: "Net Income", value: stats?.net ?? 0 },
  ];

  return (
    <div>
      <Suspense fallback={<LoadingFallback size={20} height="100px" />}>
        <OverviewStats stats={overviewStats} />
      </Suspense>
      <Suspense fallback={<LoadingFallback size={20} height="200px" />}>
        <RevenueExpenseChart data={trends} />
      </Suspense>
      <Suspense fallback={<LoadingFallback size={20} height="200px" />}>
        <CategoryBreakdownChart data={categoryData} />
      </Suspense>
      <Suspense fallback={<LoadingFallback size={20} height="200px" />}>
        <RecentTransactions />
      </Suspense>
    </div>
  );
};

export default Dashboard;
