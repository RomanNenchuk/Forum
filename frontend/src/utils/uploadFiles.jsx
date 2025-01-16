import axios from "axios";

export default async function handleUpload(files, id) {
  try {
    const fd = new FormData();
    files.forEach(file => fd.append("files", file.data));
    const response = await axios.post(
      `http://localhost:5000/attachments/${id}`,
      fd
    );
    return response.data.files.map(file => file.url);
  } catch (err) {
    console.error(err);
  }
}
