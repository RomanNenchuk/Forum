import React, { useEffect, useRef, useState } from "react";
import { Form, Card, Alert } from "react-bootstrap";
import Divider from "../Divider.jsx";
import GoogleAuthButton from "../GoogleAuthButton.jsx";
import ModalHeader from "../ModalHeader/ModalHeader.jsx";
import FormInput from "../FormInput.jsx";
import ActionButton from "../ActionButton/ActionButton.jsx";
import NavLink from "../NavLink.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useUserInfo } from "../../contexts/UserInfoContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";

import '../CreateTopic.css'

function TagExtention({ onCloseModal }){
    const srchRef = useRef()
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resData, setResData] = useState([])
    async function handleSearch(prompt) {
        try {
          let addiction = "";
          let res = [];
          if (prompt) {
            addiction = `?search=${prompt}`;
            res = await axios.get("http://localhost:5000/tags" + addiction);
          }
          else res = await axios.get("http://localhost:5000/tags?&all=true")
          setData(res.data);
        } catch (err) {
          console.error("Error fetching tags:", err);
        }
      }
      function SelectTags(selected) {
        setResData((prevData) => [...new Set(prevData).add(selected)]);
      }
    
      function DeleteTags(deleted) {
        const buf = new Set(resData);
        buf.delete(deleted);
        setResData([...buf]);
      }

      
    
      useEffect(() => {
        const fetchTags = async () => {
          try {
            const res = await axios.get("http://localhost:5000/tags?&all=true");
            setData(res.data);
            console.log(res.data);
          } catch (error) {
            console.error("Error fetching tags:", error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchTags();
      }, []); // Залежність пуста, тому `useEffect` викликається тільки один раз при монтуванні компонента
    
      if (loading) return <div>Завантаження...</div>; // Відображення стану завантаження
  return (
    <Card style = {{scrollbarWidth: "none"}}>
      <ModalHeader title={"Усі теги"} onClose={onCloseModal} />
      <Card.Body style = {{scrollbarWidth: "none"}}>
        <div style = {{display: "flex", flexDirection: "row"}}>
            <input className = "for_font input-left" style = {{width: "100%"}} type="text" placeholder="Знайти тег" 
                ref = {srchRef} onChange = {()=>{handleSearch(srchRef.current.value)}}></input>
        </div>
        {resData.map((el, index) => (
                  <span key={index} className="selected-tags" style = {{marginTop: "0.3vh"}}>
                    {el.tag_name}
                    <RxCross2 color="black" onClick={() => DeleteTags(el)} />
                  </span>
                ))}
        <div style = {{height: "60vh", width: "100%", overflowY: "scroll", overflowX: "hidden",scrollbarWidth:"none", 
            margin: "1vh"
        }}>
        {data.map((tag, index) => (
          <h5 className="tag" key={index} onClick={()=>{SelectTags(tag)}}>
            @ {tag.tag_name}
          </h5>
        ))}
        </div>
        <div style = {{marginBottom: "1vh"}}>
            <ActionButton label = "Пошук за тегами" />
        </div>
        
      </Card.Body>
    </Card>
  );
}
export default TagExtention