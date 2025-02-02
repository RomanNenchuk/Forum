import React, { useState, useRef } from "react";
import styles from "../FileModal/FileModal.module.css";
import { Card } from "react-bootstrap";
import deleteIcon from "../../assets/delete-button.svg";
import fileIcon from "../../assets/file.svg";
import addCoverIcon from "../../assets/add-cover.svg";

export default function TopicFileUploader({ files, setFiles }) {
  const fileInputRef = useRef();

  const handleFileChange = e => {
    const filesArray = Array.from(e.target.files);
    setFiles(prev => [
      ...prev,
      ...filesArray.map(file => ({
        data: file,
        name: file.name,
        isFromDatabase: false,
      })),
    ]);
  };

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
                className={styles.removeButton}
                onClick={() => handleRemoveFile(index)}
              >
                <img src={deleteIcon} alt="Delete" />
              </button>
            </li>
          ))
        ) : (
          <div className="upload-files-cover" onClick={handleImageClick}>
            <span>Завантажити файли</span>
            <img src={addCoverIcon} style={{ height: "27px" }} />
          </div>
        )}
      </ul>
      <div className={styles.actions}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className={styles.fileInput}
          multiple
        />
        <div className={styles.actionButtons}>
          <button
            type="button"
            className={`${styles.addButton} ${styles.addButtonSend}`}
            onClick={handleImageClick}
          >
            Додати
          </button>
        </div>
      </div>
    </>
  );
}
