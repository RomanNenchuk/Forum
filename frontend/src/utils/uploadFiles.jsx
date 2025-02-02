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

export async function handleImageUpload(image, topicId, token) {
  const formData = new FormData();
  formData.append("profileImage", image);
  try {
    const response = await axios.post(
      `http://localhost:5000/attachments/${topicId}/topic-screensaver`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
}
