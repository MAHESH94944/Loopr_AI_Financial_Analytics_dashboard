import React, { useMemo, useState, useEffect, Suspense, lazy } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import ErrorBoundary from "./components/common/ErrorBoundary";
import LoadingFallback from "./components/common/LoadingFallback";
import { useAuthStore } from "./store/useAuthStore";

// Lazy load components
const LoginForm = lazy(() => import("./components/auth/LoginForm"));
const RegisterForm = lazy(() => import("./components/auth/RegisterForm"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Transactions = lazy(() => import("./pages/Transactions"));
const MainLayout = lazy(() => import("./components/layout/MainLayout"));
const ExportCSVDialog = lazy(
  () => import("./components/transactions/ExportCSVDialog")
);

const AuthPage: React.FC = () => {
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  return (
    <Suspense fallback={<LoadingFallback />}>
      {isLogin ? <LoginForm /> : <RegisterForm />}
      <div style={{ textAlign: "center", marginTop: 16 }}>
        {isLogin ? (
          <span>
            Don't have an account?{" "}
            <a
              href="/register"
              style={{
                color: "#1976d2",
                textDecoration: "underline",
              }}
            >
              Register
            </a>
          </span>
        ) : (
          <span>
            Already have an account?{" "}
            <a
              href="/login"
              style={{
                color: "#1976d2",
                textDecoration: "underline",
              }}
            >
              Login
            </a>
          </span>
        )}
      </div>
    </Suspense>
  );
};

const AppContent: React.FC = () => {
  const [darkMode, setDarkMode] = React.useState<boolean>(() => {
    const stored = localStorage.getItem("darkMode");
    return stored ? stored === "true" : false;
  });
  const { user, loading, fetchUser } = useAuthStore();
  const [exportOpen, setExportOpen] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Only call fetchUser once on mount, do NOT add fetchUser as a dependency!
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        await fetchUser();
        if (isMounted) {
          setAuthChecked(true);
        }
      } catch (err: unknown) {
        if (!isMounted) return;

        if (err && typeof err === "object" && "response" in err) {
          const errorResponse = err as { response?: { status?: number } };
          if (errorResponse.response?.status === 401) {
            // 401 is expected when user is not logged in - don't redirect here
            // The routes will handle the redirect based on the user state
            console.log("User not authenticated, will redirect to login page");
          } else if (errorResponse.response?.status === 429) {
            console.warn("Rate limited, please wait before trying again");
          } else {
            // Only log non-401 errors
            console.error("Failed to fetch user:", err);
            setNetworkError(true);
          }
        } else {
          // Network error - server might be down
          setNetworkError(true);
          console.error("Network error while fetching user:", err);
        }
        if (isMounted) {
          setAuthChecked(true);
        }
      }
    };

    checkAuth();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []); // Only run on mount
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
        },
      }),
    [darkMode]
  );

  if (loading) return <LoadingFallback />;

  // Show network error if server is not reachable
  if (networkError) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <h2>Network Error</h2>
          <p>
            Unable to connect to the server. Please check if the server is
            running.
          </p>
          <button
            onClick={() => {
              setNetworkError(false);
              fetchUser().catch(() => setNetworkError(true));
            }}
            style={{
              padding: "10px 20px",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <AuthPage />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" /> : <AuthPage />}
        />
        <Route
          path="/transactions"
          element={
            user ? (
              <Suspense fallback={<LoadingFallback />}>
                <MainLayout
                  darkMode={darkMode}
                  onToggleTheme={() => setDarkMode((d) => !d)}
                >
                  <Transactions />
                </MainLayout>
              </Suspense>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              <Suspense fallback={<LoadingFallback />}>
                <MainLayout
                  darkMode={darkMode}
                  onToggleTheme={() => setDarkMode((d) => !d)}
                >
                  <Dashboard />
                </MainLayout>
              </Suspense>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} />}
        />
      </Routes>
      <Suspense fallback={null}>
        <ExportCSVDialog
          open={exportOpen}
          onClose={() => setExportOpen(false)}
        />
      </Suspense>
    </ThemeProvider>
  );
};

// Wrap AppContent with Router and ErrorBoundary
const App: React.FC = () => (
  <ErrorBoundary>
    <Router>
      <AppContent />
    </Router>
  </ErrorBoundary>
);

export default App;
