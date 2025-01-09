import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

import InteractW from "./InteractW.jsx"

import { VscSettings } from "react-icons/vsc";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";

import ProfileHeader from "../ProfileHeader.jsx";
import "./TopicList.css";


export default function TopicArea({ topic, index, indx, isEmo, setEmo, list_like, list_emo  }) {
  const location = useLocation();
  return (
    
    <li className="topic-card" key={index}>
      <div>
      <Link
        to={`topics/${topic.id}`}
        style={{ textDecoration: "none" }}
        state={{ backgroundLocation: location }}
      >
        <div className="topic-content">
          <ProfileHeader
            id={topic.author}
            avatar={topic.author_avatar}
            size="6vh"
            sizeFont="3vh"
            avThickness = '0.4vh'
            profileName={topic.author_full_name}
          />

          <div className="topic-title">
            <span style = {{marginBottom: "1vh"}}>{topic.title}</span>
          </div>
        </div>
      </Link>
      <div className="icons_menu">
        <div className="disanlike">
          {list_like.map((el, index)=>
            (<button key = {index}>{el}</button>)
          )}
        </div>
        <div className="chat_settings">
          <IoChatboxEllipsesOutline size = "3.5vh"/>
          <span onClick = {()=>{setEmo(indx + 1)}}>😀</span>
          <VscSettings size = "3.5vh"/>
                  
        </div>
        
      </div>
      {isEmo == indx + 1 ? <InteractW emolist={list_emo}/> : ''}
      </div>
    </li>
    
    
  );
}