import React from "react";
import Avatar from "../Avatar";
import { Link } from "react-router-dom";
import { CiLight } from "react-icons/ci";
import { TbMessageLanguage } from "react-icons/tb";
import { useLocation } from "react-router-dom";
import homeIcon from "../../assets/home.svg";
import chatsIcon from "../../assets/chats.svg";
import eventsIcon from "../../assets/events.svg";
import helpIcon from "../../assets/help.svg";
import languageIcon from "../../assets/language.svg";
import modIcon from "../../assets/theme.svg";
import aboutIcon from "../../assets/about.svg";
import teamIcon from "../../assets/team.svg";
import themeIcon from "../../assets/side-theme.svg";
import "./AltSide.css"
import "./Menu.css"

export default function AltSide({currentUser, avatar, fullname, setExpand}){

    const location = useLocation();
    const isActive = path => location.pathname.startsWith(path);

    


    return (
        <div style = {{ position: "fixed",top:0, left: 0,width:"100vw", height:"100vh", backgroundColor: "rgba(0, 0, 0, 0.38)", zIndex: 100000}}
        onClick = {()=>{setExpand(0)}}>
        <div style = {{ width:"max-content", backgroundColor: "#fff2d3",border:"2px solid black", zIndex: 100001}}>

                <div style = {{display: "flex", flexDirection: "row", height: "13vh", padding:"4%", backgroundColor: "#ffe6a9"}}>
                    {currentUser ? <div style={{display: "flex", flexDirection: "column",justifyContent: "flex-end",width: "50%",fontSize:"2.5vh", fontWeight: 600}}>
                        <Avatar size="5vh" avatar={avatar} />
                        <span>{fullname}</span>
                    </div> : 
                    <div style = {{display: 'flex', alignItems: "center",width: "100%"}}>
                        <button style = {{width: "100%", textAlign:"center"}}className="hd-btn">
                            Вхід
                        </button>
                    </div>}
                    <div style = {{display: "flex", flexDirection: "column", justifyContent: "flex-start", width: "50%", alignItems:"flex-end"}}>
                        <CiLight size = "4vh"/>
                        <TbMessageLanguage size="4vh"/>
                    </div>
                </div>
            <div style={{borderTop: "2px solid black"}}>
                <div className={`mn-menu-elem ${location.pathname === '/' ? "active" : ""}`}>
                    <Link to="/" id="/mn-menu-home">
                        <img src={homeIcon} alt="Home" />
                        <span>Головна сторінка</span>
                    </Link>
                </div>
                <div className={`mn-menu-elem ${isActive("/chats") ? "active" : ""}`}>
                    <Link
                        to={currentUser ? `/chats` : "/login"}
                        id="mn-menu-chats"
                        state={{
                            backgroundLocation: location,
                            redirectPath: `/chats`,
                        }}
                        >
                            <img src={chatsIcon} alt="Chats" />
                            <span>Чати</span>
                        </Link>
                    </div>
                    <div className={`mn-menu-elem ${isActive("/poptopics") ? "active" : ""}`}>
                        <Link id="mn-menu-events" to="/poptopics">
                            <img src={eventsIcon} alt="Events" />
                            <span>Популярне</span>
                        </Link>
                    </div>
                    <div className={`mn-menu-elem ${isActive("/mytopics") ? "active" : ""}`}>
                        <Link id="mn-menu-events" to={currentUser ? `/mytopics` : "/login"}>
                        <img src={themeIcon} alt="Events" />
                        <span>Теми</span>
                        </Link>
                    </div>
                    <div className={`mn-menu-elem ${isActive("/about") ? "active" : ""}`}>
                        <Link id="mn-menu-about">
                            <img src={aboutIcon} alt="About" />
                            <span>Про застосунок</span>
                        </Link>
                    </div>
                    <div className={`mn-menu-elem ${isActive("/team") ? "active" : ""}`}>
                        <Link id="mn-menu-team">
                            <img src={teamIcon} alt="Team" />
                            <span>Команда</span>
                        </Link>
                    </div>
                    <div className={`mn-menu-elem ${isActive("/help") ? "active" : ""}`}>
                        <Link id="mn-menu-help">
                            <img src={helpIcon} alt="Help" />
                            <span>Допомога</span>
                        </Link>
                    </div>
            </div>
        </div>
        </div>
    )
}