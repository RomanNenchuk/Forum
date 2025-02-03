import React from "react";
import DefaultFileUploadCover from "../DefaultFileUploadCover";
import { FaUserCircle, FaTimes } from "react-icons/fa";
import addCoverIcon from "../../assets/add-cover.svg";

const Cover = ({
  coverPreview,
  size = `150px`,
  handleImageClick,
  handleRemove,
  className = "",
  style = {},
}) => {
  const baseStyle = {
    objectFit: "cover",
    width: "auto",
    height: size,
    borderRadius: "15px",
    aspectRatio: "3 / 2",
    overflow: "hidden",
    backgroundPosition: "center",
    cursor: "pointer",
    color: "#000",
    position: "relative",
    ...style,
  };

  const crossStyle = {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    borderRadius: "50%",
    backgroundColor: "#fff",
    cursor: "pointer",
    zIndex: 10,
    border: "2px solid #000",
    padding: "2px",
  };

  return (
    <div>
      {coverPreview ? (
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={coverPreview}
            style={baseStyle}
            alt="Cover"
            className={`${className}`}
            onClick={handleImageClick}
          />
          {coverPreview && (
            <FaTimes style={crossStyle} onClick={handleRemove} />
          )}
        </div>
      ) : (
        <DefaultFileUploadCover
          title={"Бажаєте додати заставку?"}
          style={{
            border: "1px solid #bdbdbd",
            padding: "15px",
            borderRadius: "10px",
          }}
          handleImageClick={handleImageClick}
        />
      )}
    </div>
  );
};

export default Cover;
