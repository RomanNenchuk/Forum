import React from "react";
import "./AttachedFiles.css";

export default function AttachedFiles({ urls }) {
  return (
    <div className="media-grid">
      {urls?.map((url, index) => {
        const isImage = url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);
        return isImage ? (
          <img
            key={index}
            src={url}
            alt={`media-${index}`}
            className="media-image"
          />
        ) : (
          <a key={index} href={url} target="blank">
            <p className="media-url">{url.slice(url.indexOf("_") + 1)}</p>
          </a>
        );
      })}
    </div>
  );
}
