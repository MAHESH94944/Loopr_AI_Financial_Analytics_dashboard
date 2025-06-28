import React, { useState } from "react";
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Switch,
  Grid,
  Tooltip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Brightness4,
  Brightness7,
  AccountBalanceWallet,
  TableChart,
  BarChart,
} from "@mui/icons-material";
import { useAuthStore } from "../../store/useAuthStore";
import ListItemButton from "@mui/material/ListItemButton";
import { Link as RouterLink, useLocation } from "react-router-dom";

type MenuItemType = {
  text: string;
  icon: React.ReactNode;
  path: string;
};

const drawerWidth = 220;

const menuItems: MenuItemType[] = [
  { text: "Dashboard", icon: <BarChart />, path: "/dashboard" },
  { text: "Transactions", icon: <TableChart />, path: "/transactions" },
  { text: "Wallet", icon: <AccountBalanceWallet />, path: "/wallet" },
  { text: "Analytics", icon: <BarChart />, path: "/analytics" },
];

interface MainLayoutProps {
  children: React.ReactNode;
  onToggleTheme: () => void;
  darkMode: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  onToggleTheme,
  darkMode,
}) => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isSidebarCollapsed = useMediaQuery(theme.breakpoints.down("md"));
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  const handleDrawerToggle = (): void => setMobileOpen(!mobileOpen);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (): void => setAnchorEl(null);

  const handleLogout = (): void => {
    logout();
    handleMenuClose();
    window.location.href = "/login";
  };

  const drawer = (
    <Box sx={{ height: "100%", bgcolor: "background.paper" }}>
      <Toolbar>
        {!isSidebarCollapsed && (
          <Typography variant="h6" fontWeight={700} letterSpacing={1}>
            Finance Dashboard
          </Typography>
        )}
      </Toolbar>
      <List>
        {menuItems.map((item) =>
          isSidebarCollapsed ? (
            <Tooltip title={item.text} placement="right" key={item.text}>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                sx={{
                  justifyContent: "center",
                  minHeight: 56,
                  bgcolor:
                    location.pathname === item.path
                      ? "action.selected"
                      : undefined,
                  borderRadius: 2,
                  my: 0.5,
                  transition: "background 0.2s",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, justifyContent: "center" }}>
                  {item.icon}
                </ListItemIcon>
              </ListItemButton>
            </Tooltip>
          ) : (
            <ListItemButton
              key={item.text}
              component={RouterLink}
              to={item.path}
              sx={{
                bgcolor:
                  location.pathname === item.path
                    ? "action.selected"
                    : undefined,
                borderRadius: 2,
                my: 0.5,
                transition: "background 0.2s",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          )
        )}
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <CssBaseline />
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="sidebar"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      {/* Main Content */}
      <Box
        sx={{ flexGrow: 1, ml: { sm: `${drawerWidth}px` }, minHeight: "100vh" }}
      >
        {/* Topbar */}
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
            bgcolor: "background.paper",
            color: "text.primary",
            boxShadow: 2,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { sm: "none" } }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <Switch
              checked={darkMode}
              onChange={onToggleTheme}
              icon={<Brightness7 />}
              checkedIcon={<Brightness4 />}
              color="default"
              sx={{ mr: 2 }}
            />
            <IconButton onClick={handleAvatarClick} size="large">
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  color: "#fff",
                  border: "2px solid",
                  borderColor: "primary.light",
                  width: 40,
                  height: 40,
                  fontWeight: 700,
                  fontSize: 20,
                  boxShadow: 2,
                }}
              >
                {user?.email?.[0]?.toUpperCase() || "U"}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        {/* Content */}
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Grid container spacing={3}>
            <Grid>
              {/* Main content area, responsive grid */}
              {children}
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
