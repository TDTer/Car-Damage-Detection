import { Button, Card, TextField, Typography, Box } from "@mui/material";
import api from "../api/api";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const res = await api.post("/login", {
      username: data.get("username"),
      password: data.get("password"),
    });

    login(res.data.token);
    navigate("/scan", { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #6a11cb, #2575fc)",
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: "100%",
          p: 4,
          borderRadius: 3,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
        }}
      >
        <Typography
          variant="h4"
          mb={3}
          sx={{ textAlign: "center", fontWeight: "bold", color: "#333" }}
        >
          Đăng nhập
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Tên đăng nhập"
            name="username"
            margin="normal"
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <TextField
            fullWidth
            label="Mật khẩu"
            name="password"
            type="password"
            margin="normal"
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            sx={{
              mt: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: "bold",
              background: "linear-gradient(90deg, #6a11cb, #2575fc)",
              "&:hover": {
                background: "linear-gradient(90deg, #2575fc, #6a11cb)",
              },
            }}
          >
            Login
          </Button>
        </form>
      </Card>
    </Box>
  );
}
