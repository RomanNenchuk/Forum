import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useWidth } from "../../contexts/ScreenWidthContext";
import "./TopicList.css";

export default function TopicListSettings({ sortOrder, handleChange }) {
  const { currentUser } = useAuth();
  const { width } = useWidth()
  const location = useLocation();

  return (
    width > 768 ? (<div className="top-button">
      <Link
        to={currentUser ? "/create-topic" : "/login"}
        state={{
          backgroundLocation: location,
          redirectPath: "/create-topic",
        }}
      >
        <button className="add-topic-button">+ Додати тему</button>
      </Link>
      <select
        className="dropdown-button"
        value={sortOrder}
        onChange={handleChange}
      >
        <option value="desc">Новіші</option>
        <option value="asc">Давніші</option>
        <option value="rating">Популярні</option>
      </select>
    </div>) : (<div style = {{display: "flex", flexDirection: "column"}}>
      <div style={{width: "100%",borderBottom: "1px solid black",paddingBottom: "2%", marginBottom: "2vh" }}>
      <select
        className="custom-select"
        value={sortOrder}
        onChange={handleChange}
      >
        <option value="desc">Новіші</option>
        <option value="asc">Давніші</option>
        <option value="rating">Популярні</option>
      </select>
      </div>
      <div style={{display: "flex", justifyContent: "center", width: "100%"}}>
        <Link style = {{width: "90%"}}
        to={currentUser ? "/create-topic" : "/login"}
        state={{
          backgroundLocation: location,
          redirectPath: "/create-topic",
        }}
      >
        <button className="add-topic-button" style = {{width: "100%", marginBottom: "2vh"}} >+ Додати тему</button>
      </Link>
      </div>
    </div>))
  ;
}
