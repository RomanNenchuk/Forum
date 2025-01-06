import React from "react";
import "./TagBar.css";

const tagList = [
  "Вища математика",
  "ООП",
  "ДМ",
  "Бази даних",
  "ООЕ",
  "Бекенд",
  "АСД",
  "ЕЕ",
  "ЧМ",
];

export default function TagBar() {
  return (
    <div className="tag-list">
      <h5 className="tag-list-title">Популярні теги</h5>
      {tagList.map((tag, index) =>
        index < 10 ? (
          <h6 className="tag" key={index}>
            @ {tag}
          </h6>
        ) : null
      )}
    </div>
  );
}
