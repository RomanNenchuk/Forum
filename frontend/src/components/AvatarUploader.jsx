import React from "react";
import Avatar from "./Avatar.jsx";

export default function AvatarUploader({
  preview,
  setPreview,
  imageInputRef,
  setImage,
  setError,
}) {
  function handleImageChange(e) {
    setError("");
    const selectedFile = e.target.files[0];
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setImage(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setError("Будь ласка, виберіть файл у форматі JPG, JPEG, PNG або GIF");
      e.target.value = "";
    }
  }

  function handleImageClick() {
    imageInputRef.current.click();
  }

  return (
    <div className="text-center">
      <Avatar
        preview={preview}
        handleImageClick={handleImageClick}
        handleRemove={() => {
          setPreview("");
        }}
        style={{ border: "4px solid #ffd700", marginBottom: "20px" }}
      />
      <input
        type="file"
        onChange={handleImageChange}
        ref={imageInputRef}
        style={{ display: "none" }}
        accept=".jpg, .jpeg, .png, .gif"
      />
    </div>
  );
}
