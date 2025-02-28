import axios from "axios";

const PROTOCOL = import.meta.env.VITE_PROTOCOL;
const HOST = import.meta.env.VITE_HOST;
const PORT = import.meta.env.VITE_PORT;

export default async function handleUpload(files, id) {
  try {
    const fd = new FormData();
    files.forEach(file => fd.append("files", file.data));
    const response = await axios.post(
      `${PROTOCOL}://${HOST}:${PORT}/attachments/${id}`,
      fd
    );
    return response.data.files.map(file => file.url);
  } catch (err) {
    console.error(err);
  }
}
