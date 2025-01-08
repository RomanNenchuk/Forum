import React from "react";
import addFile from "../assets/add-file.svg";

export default function FileUploader({ setFiles, fileInputRef }) {
  function handleImageClick() {
    fileInputRef.current.click();
  }

  return (
    <div>
      <img src={addFile} alt="Add file" onClick={handleImageClick} />
      <input
        ref={fileInputRef}
        type="file"
        // style={{ display: "none" }}
        onChange={e => setFiles(e.target.files)}
        multiple
      />
    </div>
  );
}
