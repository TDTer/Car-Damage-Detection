import { Box, Button, Stack, Typography } from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import SwitchCameraIcon from "@mui/icons-material/SwitchCamera";
import { useRef, useState, useEffect } from "react";

export default function CameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [devices, setDevices] = useState([]);
  const [cameraIndex, setCameraIndex] = useState(0);

  // Lấy danh sách camera
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devs) => {
      const videoDevices = devs.filter((d) => d.kind === "videoinput");
      setDevices(videoDevices);
    });
  }, []);

  const startCamera = async (index = 0) => {
    try {
      stopCamera();
      const deviceId = devices[index]?.deviceId;
      const constraints = deviceId ? { video: { deviceId } } : { video: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;

        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setCameraOn(true))
            .catch((err) => console.error("Không thể play video", err));
        } else {
          setCameraOn(true);
        }
      }
    } catch (err) {
      console.error("Không thể mở camera", err);
      alert("Không thể mở camera. Kiểm tra quyền truy cập.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  const capture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      onCapture(blob);
      stopCamera();
    }, "image/jpeg");
  };

  const switchCamera = () => {
    if (devices.length <= 1) return;
    const nextIndex = (cameraIndex + 1) % devices.length;
    setCameraIndex(nextIndex);
    startCamera(nextIndex);
  };

  return (
    <Box>
      <Box
        sx={{
          width: "100%",
          aspectRatio: "4/3",
          bgcolor: "#000",
          borderRadius: 2,
          overflow: "hidden",
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <video
          ref={videoRef}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: cameraOn ? "block" : "none",
          }}
          autoPlay
          playsInline
          muted
        />
        {!cameraOn && (
          <Stack alignItems="center" justifyContent="center" color="gray">
            <CameraAltIcon sx={{ fontSize: 60 }} />
            <Typography>Camera đang tắt</Typography>
          </Stack>
        )}
      </Box>

      <Stack direction="row" spacing={2} justifyContent="center">
        {!cameraOn ? (
          <Button
            variant="contained"
            startIcon={<CameraAltIcon />}
            onClick={() => startCamera(cameraIndex)}
          >
            Mở camera
          </Button>
        ) : (
          <>
            <Button
              variant="contained"
              color="success"
              startIcon={<PhotoCameraIcon />}
              onClick={capture}
            >
              Chụp
            </Button>
            {devices.length > 1 && (
              <Button
                variant="outlined"
                startIcon={<SwitchCameraIcon />}
                onClick={switchCamera}
              >
                Chuyển camera
              </Button>
            )}
            <Button
              variant="outlined"
              color="error"
              startIcon={<StopCircleIcon />}
              onClick={stopCamera}
            >
              Tắt
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
}
