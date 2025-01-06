import React from "react";
import Avatar from "./Avatar";
import { useNavigate, useLocation } from "react-router-dom";

export default function ProfileHeader({
  id,
  avatar,
  profileName,
  size = 50,
  gap = "1rem",
  className = "",
  style = {},
  textStyle = {},
  order = "avatar-first", // "avatar-first" або "text-first"
}) {
  const navigate = useNavigate();
  const location = useLocation();

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/profiles/${id}`, {
      state: { backgroundLocation: location },
    });
  }

  const isAvatarFirst = order === "avatar-first";

  return (
    <div
      className={`profile-header d-flex align-items-center ${className}`}
      style={{
        gap,
        cursor: "pointer",
        flexDirection: isAvatarFirst ? "row" : "row-reverse",
        ...style,
      }}
      onClick={handleClick}
    >
      <Avatar avatar={avatar} size={size} />
      {profileName && (
        <span
          style={{
            color: "#555",
            fontSize: "1.2rem",
            lineHeight: "1.2rem",
            ...textStyle,
          }}
        >
          {profileName}
        </span>
      )}
    </div>
  );
}
