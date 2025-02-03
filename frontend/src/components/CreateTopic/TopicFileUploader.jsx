import React, { useEffect, useRef } from "react";
import DefaultFileUploadCover from "../DefaultFileUploadCover.jsx";
import deleteIcon from "../../assets/delete-button.svg";
import fileIcon from "../../assets/file.svg";

export default function TopicFileUploader({ files, setFiles, setWarning }) {
  const fileInputRef = useRef();

  const handleFileChange = e => {
    setWarning("");
    setFiles(prev => [...prev, ...Array.from(e.target.files)]);
  };

  useEffect(() => {
    setWarning("");
    console.log("files changed");
    if (files.length > 10) {
      console.log("warning");
      setWarning(
        "Можна додати до 10 файлів. Решта вкладень не буде врахована."
      );
    }
  }, [files]);

  const handleRemoveFile = index => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleImageClick = () => fileInputRef.current.click();

  return (
    <>
      <ul className="file-upload-container">
        {files.length ? (
          files.map((file, index) => (
            <li key={index} className="uploaded-file-item">
              <div className="file-header">
                <img src={fileIcon} alt="File" />
                <span className="file-name">{file.name}</span>
              </div>
              <button
                type="button"
                className="remove-button"
                onClick={() => handleRemoveFile(index)}
              >
                <img src={deleteIcon} alt="Delete" />
              </button>
            </li>
          ))
        ) : (
          <DefaultFileUploadCover
            title={"Завантажити файли"}
            handleImageClick={handleImageClick}
            style={{ border: "none" }}
          />
        )}
      </ul>
      <div className="actions">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
          multiple
        />
        <div className="action-buttons">
          <button
            type="button"
            className="add-button"
            onClick={handleImageClick}
          >
            Додати
          </button>
        </div>
      </div>
    </>
  );
}
