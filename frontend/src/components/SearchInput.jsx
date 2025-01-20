import React, {useState, useRef} from "react";
import { Form } from "react-bootstrap";
import { RxCross2 } from "react-icons/rx";
import "./CreateTopic.css";

const SearchInput = ({resData,setResData, data })=>{
    const tagsRef = useRef();

    const [search, setSearch] = useState(false)
    const [resSearch, setResSearch] = useState([])

    function handleSearch(prompt){
        return data.filter((el) =>
          el.toLowerCase().includes(prompt.toLowerCase())
        )
      }
    
      const handleKeyDown = (e ) => {
        if (e.key === 'Enter') {
          e.preventDefault(); // Запобігає відправці форми при натисканні Enter
          SelectTags(tagsRef.current.value)
        }
      };
    
      function SelectTags(selected){
        setResData(()=>{return [...new Set(resData).add(selected)]})
      }
      function DeleteTags(deleted){
        console.log('зайшов')
        const buf = new Set(resData)
        buf.delete(deleted)
        setResData([...buf])
      }

    return (<Form.Group id="tags" className="mb-3">
        <div>
          <Form.Control type="text" ref={tagsRef} onFocus = {()=>{setSearch(true)}} 
          placeholder="Оберіть теги" className = "for_font input-left"
          onChange = {()=>{setResSearch(handleSearch(tagsRef.current.value))}} 
          onBlur = {()=>{setTimeout(()=>setSearch(false),150)}} 
          onKeyDown={handleKeyDown}
          style = {{position: "relative", width: "100%", zIndex: 2}}/>
            <div 
              style={{
              position: "absolute",
              width: "20%",
              ...(resSearch.length === 0 && { display: "none" }) // Умовне додавання стилю
              }}>
              {search && (
                <ul className = "find-list">
                  {
                    resSearch.slice(0,5).map((el, index)=>(
                      <li key = {index} onClick = {()=>{SelectTags(el)}}>{el}</li>
                    ))}
                </ul>
              )}
            </div>
            </div>
              <div style= {{display: "flex", flexDirection: "row", flexWrap: "wrap"}}>
                {resData.map((el)=>(<span className = "selected-tags" >{el}
                  <RxCross2 color = "black" onClick = {()=>{DeleteTags(el)}}/></span>))}
              </div>
      </Form.Group>)
}

export default SearchInput;