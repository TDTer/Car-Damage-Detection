import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Divider,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UploadIcon from "@mui/icons-material/Upload";
import CameraCapture from "../components/CameraCapture";
import api from "../api/api";

// Hàm upload trả về Blob
export const uploadScan = async (file) => {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post("/scan", form, { responseType: "blob" });
  return res.data; // Blob ảnh
};

export default function ScanPage() {
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupImage, setPopupImage] = useState(null);

  const showPopup = (blob) => {
    const url = URL.createObjectURL(blob); // tạo URL tạm từ Blob
    setPopupImage(url);
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setPopupImage(null);
  };

  // Scan xong
  const handleCapture = async (blob) => {
    try {
      const uploadedBlob = await uploadScan(blob); // upload -> nhận ảnh
      showPopup(uploadedBlob); // hiện popup
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  // Upload từ máy
  const handleUpload = async (file) => {
    try {
      const uploadedBlob = await uploadScan(file);
      showPopup(uploadedBlob);
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      <CardContent>
        <Typography variant="h5" mb={2}>
          📷 Scan ảnh
        </Typography>

        <CameraCapture onCapture={handleCapture} />

        <Divider sx={{ my: 3 }}>HOẶC</Divider>

        <Stack alignItems="center" mb={3}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            component="label"
          >
            Upload ảnh từ máy
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e.target.files[0])}
            />
          </Button>
        </Stack>

        {/* Popup hiển thị ảnh */}
        <Dialog open={popupOpen} onClose={handleClosePopup} maxWidth="sm" fullWidth>
          <DialogTitle>
            Ảnh vừa scan
            <IconButton
              aria-label="close"
              onClick={handleClosePopup}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {popupImage && (
              <img
                src={popupImage}
                alt="scan-result"
                style={{ width: "100%", borderRadius: 8 }}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
