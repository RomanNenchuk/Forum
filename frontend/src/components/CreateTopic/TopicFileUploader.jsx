import React, { useState, useRef } from "react";
import styles from "../FileModal/FileModal.module.css";
import { Card } from "react-bootstrap";
import deleteIcon from "../../assets/delete-button.svg";
import fileIcon from "../../assets/file.svg";

export default function TopicFileUploader({
  files,
  onClose,
  setFiles,
  onSubmit,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = () => {
    setIsSubmitting(true);
    onSubmit();
  };

  const handleRemoveFile = index => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <>
      <ul className={styles.fileList}>
        {files.map((file, index) => (
          <li key={index} className={styles.fileItem}>
            <div className={styles.fileHeader}>
              <img src={fileIcon} alt="File" />
              <span className={styles.fileName}>{file.name}</span>
            </div>
            <button
              className={styles.removeButton}
              onClick={() => handleRemoveFile(index)}
            >
              <img src={deleteIcon} alt="Delete" />
            </button>
          </li>
        ))}
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
            onClick={() => fileInputRef.current.click()}
          >
            Додати
          </button>
          <div className={styles.actionButtonsGroup}>
            <button
              type="button"
              className={`${styles.cancelButton} ${styles.cancelButtonSend}`}
              onClick={onClose}
            >
              Скасувати
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
