import React from "react";
import Modal from "../Modal.jsx";
import ModalHeader from "../ModalHeader/ModalHeader.jsx";
import styles from "../FileModal/FileModal.module.css";
import { Card } from "react-bootstrap";

export default function ConfirmationModal({ onClose, onConfirm, message }) {
  return (
    <Modal onCloseModal={onClose}>
      <Card className={styles.modalCard}>
        <ModalHeader title={message} onClose={onClose} />
        <Card.Body className={styles.cardBody}>
          <div
            className={`${styles.actionButtons} ${styles.confirmationButtons}`}
          >
            <button className={styles.cancelButton} onClick={onClose}>
              Скасувати
            </button>
            <button className={styles.submitButton} onClick={onConfirm}>
              Підтвердити
            </button>
          </div>
        </Card.Body>
      </Card>
    </Modal>
  );
}
