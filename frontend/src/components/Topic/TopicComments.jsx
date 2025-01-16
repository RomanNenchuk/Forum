import React, { useState, useEffect } from "react";
import { Container, Card } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext.jsx";
import AttachedFiles from "../AttachedFiles/AttachedFiles.jsx";
import { timestampToTime } from "../../utils/getCurrentTime.jsx";
import ProfileHeader from "../ProfileHeader.jsx";
import "./Comments.css"

export default function TopicComments({ 
    handleOnContextMenu,
    comments,
    getComment, 
    getUserFullname,
    uid
  }) {
  const { currentUser } = useAuth();
  const [replies, setReplies] = useState({});

  return(
    <ul style = {{display: "flex", width: "100%", flexDirection: "column-reverse"}}>
      {comments.length ? comments.map(
        (comment) => {
          return(
            <div className = "comment-outer" style = {currentUser.uid === comment.author_id ?
               {textAlign: "right", marginLeft: "auto",marginRight: "2vh"} : 
               {textAlign: "left", marginRight: "auto", marginLeft: "2vh"}}
               >
              <ProfileHeader id = {comment.author_id} avatar = {comment.avatar} profileName={comment.author_username + (uid === comment.author_id ? ("(Автор)") : (''))} 
              sizeFont="2vh" size = "4vh"/>
              <span>{comment.text}</span><br/>
              <span>{timestampToTime(comment.timestamp)}</span>
            </div>    
          );
        }
      ) : [
        <Card>
          <Card.Body>
            Ви можете стати першим, хто дасть відповідь на це повідомлення!
          </Card.Body>
        </Card>
      ]}
    </ul>
  );
}