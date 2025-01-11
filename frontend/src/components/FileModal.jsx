import React from "react";
import ReactDOM from "react-dom";
import styles from "./Chat/Chat.module.css";

export default function FileModal({ files, onClose, onRemoveFile, setFiles }) {
  const handleFileChange = e => {
    setFiles(prevFiles => [
      ...prevFiles,
      {
        data: e.target.files[0],
        name: e.target.files[0].name,
        isFromDatabase: false,
      },
    ]);
  };

  return ReactDOM.createPortal(
    <div className={styles.modal}>
      <div className={styles["modal-content"]}>
        <h3>Selected Files</h3>
        <ul>
          {files.map((file, index) => (
            <li key={index}>
              {file.name} {file.isFromDatabase && <span>(from database)</span>}
              <button onClick={() => onRemoveFile(index)}>Remove</button>
            </li>
          ))}
        </ul>
        <input type="file" onChange={handleFileChange} />
        <button className={styles.button} onClick={onClose}>
          Close
        </button>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}
