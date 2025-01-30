import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import handleUpload from "../utils/uploadFiles.jsx";
import FileButtonUploader from "./FileButtonUploader.jsx";
import ActionButton from "./ActionButton/ActionButton.jsx";
import TitleInput from "./TitleInput.jsx";
import SearchInput from "./SearchInput.jsx";
import BaseWrapInput from "./BaseWrapInput.jsx";
import { IoArrowBack } from "react-icons/io5";
import './CreateTopic.css'
import axios from "axios";

export default function CreateTopic() {
  const titleRef = useRef();
  
  const navigate = useNavigate();
  
  const headerFileRef = useRef()


  const { currentUser, token } = useAuth();

  const descriptionRef = useRef();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [headerFiles, setHeaderFiles] = useState([])
  const [extendfiles, setExtendFiles] = useState([])
  const [firstStepChoose, setFirstStepChoose] = useState(0)
  const [step, setStep] = useState(0)
  const [selectedTag, setSelected] = useState([])

  const [scaleValue, setScaleValue] = useState(window.innerHeight * 0.0015);
  const updateScaleValue = () => {
    setScaleValue(window.innerHeight * 0.0015);
  };

  useEffect(() => {
    window.addEventListener("resize", updateScaleValue);
    return () => {
      window.removeEventListener("resize", updateScaleValue);
    };
  }, []);

  const [buf, setBuf] = useState({
    title: '',
    tags: [], 
    description: '',
    attachments: []
  })
  

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    getFromSecond();
    if (!buf.title ){
      setError("Незаповнено усі необхідні поля: не надано назву для теми")
      setTimeout(()=>{setError(false)},3000)
      setLoading(false)
      return
    }
    const topicData = {
      ...buf,
      author: currentUser.uid, 
      description: descriptionRef.current.value,
      attachments: await handleUpload(buf.attachments, currentUser.id),
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/topics",
        topicData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Передаємо токен
          },
        }
      );

      if (response.status !== 201) {
        throw new Error("Failed to create topic");
      }
      setSuccess("Topic created successfully!");

      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function getFromFirst(){
    setBuf(()=>{return{
      title: titleRef.current.value,
      tags: selectedTag, 
    }})
  }
  function getFromSecond(){
    const temp = descriptionRef.current.value || ""; // Додаткова перевірка
    console.log(temp)
    setBuf((prevBuf) => ({
      ...prevBuf,
      description: temp,    //??не оновлює
      attachments: extendfiles
    }))
    
  }
  return (
    <Container>
      <div className="cr-topic-in">
            <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)"}}> 
              {step ? (<IoArrowBack style = {{gridColumn: 1}} onClick = {()=>{getFromSecond(),setTimeout(()=>{setStep(0)}, 50)}} size = "4vh" / >) : ''}
              <span style = {{gridColumn: 2, fontSize: "4vh", textAlign: "center"}}>Створити тему</span></div>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            {!step ? (<div className = "chooser">
              <div style = {firstStepChoose === 0 ? {fontSize: "2.5vh",boxShadow: "0 0.3vh 0 0 #659287"} : {fontSize: "2.5vh"}}
              onClick = {()=>setFirstStepChoose(0)}>Текст</div>
              <div style = {firstStepChoose !== 0 ? {fontSize: "2.5vh",boxShadow: "0 0.3vh 0 0 #659287"} : {fontSize: "2.5vh"}}
              onClick = {()=>setFirstStepChoose(1)}>Фото&Відео</div>
            </div>) : ''}
            <Form onSubmit={handleSubmit}>
              {!step ? (<TitleInput titleRef={titleRef} limit = {!firstStepChoose ? 255 : 200} value = {buf.title}/>) : ''}
              {!step ? (<SearchInput resData = {selectedTag} setResData = {setSelected} />) : ''}
              {step ? (<BaseWrapInput ref = {descriptionRef} value = {buf.description}/>) : ""}
              

              {step ? (
                <FileButtonUploader files = {extendfiles} setFiles = {setExtendFiles}/>
              ) : 
              firstStepChoose ? (
                <FileButtonUploader files = {headerFiles} setFiles = {setHeaderFiles}/>
              ) : ''}
              <div style = {{display: "flex", justifyContent: "center"}}>
              <div className = "button" style = {{transform: `scale(${scaleValue})`}}>
                {!step ? (<ActionButton onClick = {(e)=>{ e.preventDefault();e.stopPropagation(); getFromFirst(); setStep(1)}} label = "Продовжити" loading={null} type = "button"/>) :
                (<ActionButton label = {loading ? "Створення..." : "Створити тему"} loading={loading} type = "submit"/>)}
              </div></div>
            </Form>
      </div>
    </Container>
  );
}
