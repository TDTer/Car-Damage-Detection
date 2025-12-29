import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
} from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const drawerWidth = 220;

export default function AppLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <Box sx={{ display: "flex" }}>
      {/* TOP BAR */}
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Phát hiện hư hỏng ngoại thất ô tô
          </Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* SIDE BAR */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            mt: "64px",
          },
        }}
      >
        <List>
          <ListItemButton onClick={() => navigate("/scan")}>
            <ListItemText primary="Scan ảnh" />
          </ListItemButton>
          <ListItemButton onClick={() => navigate("/gallery")}>
            <ListItemText primary="Quản lý ảnh" />
          </ListItemButton>
          <ListItemButton onClick={() => navigate("/stats")}>
            <ListItemText primary="Thống kê" />
          </ListItemButton>
        </List>
      </Drawer>

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: "64px",
          ml: `${drawerWidth}px`,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
