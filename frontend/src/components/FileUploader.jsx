import React from "react";
import addFileIcon from "../assets/add-file.svg";
import editFileIcon from "../assets/edit-file.svg";

export default function FileUploader({
  setFiles,
  fileInputRef,
  editId,
  setIsModalOpen,
}) {
  function handleImageClick() {
    fileInputRef.current.click();
  }

  return (
    <div>
      {editId === -1 ? (
        <img
          src={addFileIcon}
          style={{ cursor: "pointer" }}
          alt="Add file"
          onClick={handleImageClick}
        />
      ) : (
        <img
          src={editFileIcon}
          style={{ cursor: "pointer" }}
          alt="Edit file"
          onClick={() => setIsModalOpen(true)}
        />
      )}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={e => {
          setFiles(
            Array.from(e.target.files).map(file => ({
              data: file,
              name: file.name,
              isFromDatabase: false,
            }))
          );
        }}
        multiple
      />
    </div>
  );
}
