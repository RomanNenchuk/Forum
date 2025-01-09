import React,{useState, useEffect, useRef} from "react";
import "./TagBar.css";

export default function TagExtent({tagList, onClose}){

    const [inList,setList] = useState(tagList)
    const srchRef = useRef()
    const modalRef = useRef();
    
    useEffect(() => {
        function handleClickOutside(event) {
          if (modalRef.current && !modalRef.current.contains(event.target)) {
            onClose(); // Викликаємо функцію закриття, передану через props
          }
        }
    
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, [onClose]);


      function handleFinding(prompt) {
        if (prompt.trim() === "") return tagList;
        return tagList.filter((el) =>
          el.toLowerCase().includes(prompt.toLowerCase())
        );
      }


    return (
    <div className = "tag-outer-ext">
        <div className="tag-list-ext" ref={modalRef}>
            <div className="tag-list-title-ext">
                <span>Усі теги</span>
                <input type="text" placeholder="Знайти тег" 
                ref = {srchRef} onChange = {()=>{setList(handleFinding(srchRef.current.value))}}></input>
            </div>
            {inList.length === 0 ? (<span style = {{fontSize: '2vh'}}>Тег не знайдено</span>) : 
                inList.map((tag, index) => (
                    <h6 className="tag" key={index}>
                        @ {tag}
                    </h6>))
                }

                
        </div>
    </div>
    )
}