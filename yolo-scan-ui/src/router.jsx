import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ScanPage from "./pages/ScanPage";
import GalleryPage from "./pages/GalleryPage";
import StatsPage from "./pages/StatsPage";
import AppLayout from "./components/AppLayout";
import { useAuth } from "./auth/AuthContext";

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <LoginPage />;
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
