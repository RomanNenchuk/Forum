import React, { useRef } from "react";
import Avatar from "./Avatar.jsx";

export default function AvatarUploader({
  preview,
  setPreview,
  avatar,
  imageInputRef,
  setImage,
}) {
  function handleImageChange(e) {
    const selectedFile = e.target.files[0];
    setImage(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  }

  function handleImageClick() {
    imageInputRef.current.click();
  }

  return (
    <div className="text-center">
      <Avatar
        preview={preview}
        {...(avatar && { avatar })} // передаємо avatar тільки якщо він існує
        handleImageClick={handleImageClick}
        style={{ border: "4px solid #ffd700", marginBottom: "20px" }}
      />
      <input
        type="file"
        onChange={handleImageChange}
        ref={imageInputRef}
        style={{ display: "none" }}
        accept="image/*"
      />
    </div>
  );
}
