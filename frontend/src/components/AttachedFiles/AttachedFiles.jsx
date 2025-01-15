import React from "react";
import fileIcon from "../../assets/file.svg";
import "./AttachedFiles.css";

export default function AttachedFiles({ urls, onImageLoad }) {
  return (
    <div className="media-grid">
      {urls?.map((url, index) => {
        const isImage = url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);
        return isImage ? (
          <img
            key={index}
            src={url}
            alt={`media-${index}`}
            onLoad={onImageLoad}
            className="media-image"
          />
        ) : (
          <a key={index} href={url} target="blank" style={{ width: "100%" }}>
            <div key={index} className="file-item">
              <div className="file-header">
                <img src={fileIcon} alt="File" height={30} />
                <span className="file-name">
                  {url.slice(url.indexOf("_") + 1)}
                </span>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
