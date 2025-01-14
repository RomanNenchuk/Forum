import React, { useState, useEffect } from "react";
import { Container, Card } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext.jsx";
import AttachedFiles from "../AttachedFiles/AttachedFiles.jsx";
import { timestampToTime } from "../../utils/getCurrentTime.jsx";

export default function TopicComments({ 
    handleOnContextMenu,
    comments,
    getComment, 
    getUserFullname 
  }) {
  const { currentUser } = useAuth();
  const [replies, setReplies] = useState({});
  return(
    <ul>
      {comments.length ? comments.map(
        (comment) => {
          return(
            <Card>
              <Card.Header>
                <Card.Img 
                  src={comment.avatar} 
                  style={{ width: '50px', height: '50px' }}
                />
                <Card.Text>{comment.author_username}</Card.Text>
                <Card.Text>{timestampToTime(comment.timestamp)}</Card.Text>
              </Card.Header>
              <Card.Body>
                <Card.Text>
                {comment.text}
                </Card.Text>
              </Card.Body>
            </Card>
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