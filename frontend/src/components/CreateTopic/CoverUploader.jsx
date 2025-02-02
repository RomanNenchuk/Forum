import React, { useRef } from "react";
import Cover from "./Cover.jsx";

export default function CoverUploader({
  coverPreview,
  setCoverPreview,
  setCover,
  setError,
}) {
  const coverInputRef = useRef(null);

  function handleImageChange(e) {
    setError("");
    const selectedFile = e.target.files[0];
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setCover(selectedFile);
      setCoverPreview(URL.createObjectURL(selectedFile));
    } else {
      setError("Будь ласка, виберіть файл у форматі JPG, JPEG, PNG або GIF");
      e.target.value = "";
    }
  }

  function handleImageClick() {
    coverInputRef.current.click();
  }

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
        accept=".jpg, .jpeg, .png, .gif"
      />
    </div>
  );
}
