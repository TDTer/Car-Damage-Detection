import { useEffect, useState } from "react";
import api from "../api/api";
import { Line, Pie } from "react-chartjs-2";
import { Card, Typography, Stack, Box } from "@mui/material";
import "chart.js/auto";

export default function StatsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/stats").then((res) => setStats(res.data));
  }, []);

  if (!stats) return null;

  const scanPerDay = {
    labels: stats.scan_per_day.map((i) => i.date),
    datasets: [
      {
        label: "Số lần scan",
        data: stats.scan_per_day.map((i) => i.total_scans),
        borderWidth: 2,
        backgroundColor: "rgba(33,150,243,0.2)",
        borderColor: "rgba(33,150,243,1)",
      },
    ],
  };

  const objectByClass = {
    labels: stats.objects_by_class.map((i) => i.class_name),
    datasets: [
      {
        data: stats.objects_by_class.map((i) => i.total),
        backgroundColor: [
          "#2196F3",
          "#4CAF50",
          "#FFC107",
          "#F44336",
          "#9C27B0",
          "#FF5722",
        ],
      },
    ],
  };

  return (
    <Stack spacing={3} sx={{ px: 2, py: 3 }}>
      {/* Chart Scan per Day */}
      <Card sx={{ p: 2, maxWidth: 700, mx: "auto" }}>
        <Typography variant="h6" mb={2}>
          📈 Scan theo ngày
        </Typography>
        <Box sx={{ height: 250 }}>
          <Line
            data={scanPerDay}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </Box>
      </Card>

      {/* Chart Object By Class */}
      <Card sx={{ p: 2, maxWidth: 700, mx: "auto" }}>
        <Typography variant="h6" mb={2}>
          🧠 Tỉ lệ object nhận diện
        </Typography>
        <Box sx={{ height: 250 }}>
          <Pie
            data={objectByClass}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </Box>
      </Card>
    </Stack>
  );
}
