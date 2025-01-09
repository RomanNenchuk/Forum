import React,{useState} from "react";
import "./TagBar.css";
import TagExtent from "./TagExtent";
import { FaSalesforce } from "react-icons/fa";


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
  const [isExtentTag, setExtentTag] = useState(false)

  
    return (
    <>
    <div className="tag-list">
      <h5 className="tag-list-title">Популярні теги</h5>
      {tagList.map((tag, index) =>
        index < 5 ? (
          <h6 className="tag" key={index}>
            @ {tag}
          </h6>
        ) : null
      )}
      <span style = {{cursor: "pointer"}}onClick = {()=>{setExtentTag(!isExtentTag)}}>Показати більше</span>
    </div>
    {isExtentTag ? <TagExtent tagList={tagList} onClose={() => setExtentTag(false)}/> : ''}
    </>
  );
}
