import { useState } from "react";
import { Box, IconButton, Typography, Modal } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Gallery({ images, onDelete }) {
  const [preview, setPreview] = useState(null); // ảnh đang xem

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
          mt: 2,
        }}
      >
        {images.map((img) => (
          <Box
            key={img.id}
            sx={{ position: "relative", width: "160px", height: "160px", cursor: "pointer" }}
          >
            <img
              src={img.url}
              alt={`scan-${img.id}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 8,
              }}
              onClick={() => setPreview(img.url)}
            />

            {/* Overlay info */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                bgcolor: "rgba(0,0,0,0.5)",
                color: "#fff",
                p: "2px 4px",
                fontSize: 12,
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
              }}
            >
              {img.total_objects} objects | {img.scan_datetime}
            </Box>

            {onDelete && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation(); // tránh click vào preview
                  onDelete(img.id);
                }}
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  bgcolor: "rgba(0,0,0,0.4)",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
                  color: "#fff",
                }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        ))}
      </Box>

      {/* Modal preview ảnh */}
      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box sx={{ maxWidth: "90%", maxHeight: "90%" }}>
          <img
            src={preview}
            alt="preview"
            style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 8 }}
          />
        </Box>
      </Modal>
    </>
  );
}
