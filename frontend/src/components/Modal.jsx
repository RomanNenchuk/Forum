import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";

function Modal({ children }) {
  const navigate = useNavigate();

  const closeModal = () => {
    navigate(-1);
  };

  useEffect(() => {
    // заборонити прокрутку сторінки при відкритті модального вікна
    document.body.style.overflow = "hidden";
    return () => {
      // відновити прокрутку при закритті
      document.body.style.overflow = "";
    };
  }, []);

  return ReactDOM.createPortal(
    <div className="glob" onClick={closeModal}>
      <div className="glob-reg" onClick={e => e.stopPropagation()}>
        {React.cloneElement(children, { closeModal })}
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}

export default Modal;
