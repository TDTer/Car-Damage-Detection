import { useEffect, useState } from "react";
import api from "../api/api";
import Gallery from "../components/Gallery";

export default function GalleryPage() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const res = await api.get("/scans"); // lấy danh sách scan
        const scans = res.data;

        // Fetch từng ảnh từ backend và giữ info
        const imgs = await Promise.all(
          scans.map(async (s) => {
            const imgRes = await api.get(`/scan/image/${s.id}`, {
              responseType: "blob",
            });
            const url = URL.createObjectURL(imgRes.data);

            return {
              id: s.id,
              url,                       // ảnh
              total_objects: s.total_objects,
              scan_datetime: s.scan_datetime,
            };
          })
        );

        setImages(imgs);
      } catch (err) {
        console.error(err);
      }
    };

    fetchScans();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/scan/${id}`);
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return <Gallery images={images} onDelete={handleDelete} />;
}
