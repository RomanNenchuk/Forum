import React from "react";
import { FaUserCircle } from "react-icons/fa";

const Avatar = ({
  preview,
  avatar,
  size = 120,
  handleImageClick,
  className = "",
  style = {},
}) => {
  const baseStyle = {
    objectFit: "cover",
    width: "auto",
    height: `${size}px`,
    aspectRatio: "1 / 1",
    borderRadius: "50%",
    overflow: "hidden",
    backgroundPosition: "center",
    cursor: "pointer",
    color: "#000",
    ...style,
  };

  return (
    <>
      {preview || avatar ? (
        <img
          src={preview || avatar}
          style={baseStyle}
          alt="Avatar"
          className={`${className}`}
          onClick={handleImageClick}
        />
      ) : (
        <FaUserCircle
          style={baseStyle}
          className={className}
          onClick={handleImageClick}
        />
      )}
    </>
  );
};

export default Avatar;
