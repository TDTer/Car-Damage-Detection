import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8001", // đổi theo server của bạn
  headers: {
    Authorization: localStorage.getItem("token") || "",
  },
});

// Lấy danh sách scans
export const getScans = async () => {
  const res = await api.get("/scans");
  return res.data;
};

// Upload scan
export const uploadScan = async (file) => {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post("/scan", form, { responseType: "blob" });
  return res.data;
};

// ✅ Xóa scan
export const deleteScan = async (id) => {
  const res = await api.delete(`/scan/${id}`);
  return res.data;
};

export default api;
