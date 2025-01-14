import React, { useRef } from "react";
import Modal from "../Modal.jsx";
import ModalHeader from "../ModalHeader/ModalHeader.jsx";
import styles from "./FileModal.module.css";
import { Card } from "react-bootstrap";
import deleteIcon from "../../assets/delete-button.svg";
import fileIcon from "../../assets/file.svg";

export default function FileSendModal({
  files,
  onClose,
  setFiles,
  text,
  setText,
  onSubmit,
}) {
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

  return (
    <Modal onCloseModal={onClose}>
      <Card className={styles.modalCard}>
        <ModalHeader title={"Вибрані файли"} onClose={onClose} />
        <Card.Body className={styles.cardBody}>
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
            <textarea
              className={`${styles.textInput} ${styles.fileModalTextarea}`}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Напишіть повідомлення..."
              rows={2}
            />
            <div className={styles.actionButtons}>
              <button
                className={`${styles.addButton} ${styles.addButtonSend}`}
                onClick={() => fileInputRef.current.click()}
              >
                Додати
              </button>
              <div className={styles.actionButtonsGroup}>
                <button
                  className={`${styles.cancelButton} ${styles.cancelButtonSend}`}
                  onClick={onClose}
                >
                  Скасувати
                </button>
                <button
                  onClick={onSubmit}
                  className={`${styles.submitButton} ${styles.submitButtonSend}`}
                >
                  Надіслати
                </button>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Modal>
  );
}
