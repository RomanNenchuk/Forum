import React, { useRef } from "react";
import Cover from "./Cover.jsx";
import { generateVideoThumbnail } from "../../utils/videoThumbnail.jsx";

export default function CoverUploader({
  coverPreview,
  setCoverPreview,
  setCover,
  setError,
}) {
  const coverInputRef = useRef(null);

  async function handleImageChange(e) {
    setError("");
    const selectedFile = e.target.files[0];
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "video/mp4",
    ];

    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      let url = URL.createObjectURL(selectedFile);
      if (selectedFile.type === "video/mp4") {
        url = await generateVideoThumbnail(url);
      }
      setCover(selectedFile);
      setCoverPreview({
        type: selectedFile.type,
        url,
      });
    } else {
      setError(
        "Будь ласка, виберіть файл у форматі JPG, JPEG, PNG, GIF або MP4"
      );
      e.target.value = "";
    }
  }

  const handleImageClick = () => coverInputRef.current.click();

  return (
    <div className="text-center my-5">
      <Cover
        coverPreview={coverPreview}
        handleImageClick={handleImageClick}
        handleRemove={() => {
          setCoverPreview("");
        }}
      />
      <input
        type="file"
        onChange={handleImageChange}
        ref={coverInputRef}
        style={{ display: "none" }}
        accept=".jpg, .jpeg, .png, .gif, .mp4"
      />
    </div>
  );
}
