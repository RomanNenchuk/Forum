import React, { useState, useEffect } from "react";
import { Container, Card } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext.jsx";
import AttachedFiles from "../AttachedFiles/AttachedFiles.jsx";
import { timestampToTime } from "../../utils/getCurrentTime.jsx";

export default function TopicComments({ 
    handleOnContextMenu,
    comments,
  }) {
  let sortedComments = comments;
  sortedComments.sort((a, b) => { // ще не готово
    if (a.reply === b.id) {
      return 1;
    }
    if (a.reply === b.reply) {
      return new Date(a.timestamp).getTime() - 
      new Date(b.timestamp).getTime();
    }
    return new Date(b.timestamp).getTime() - 
    new Date(a.timestamp).getTime();
  });
  return(
    <ul>
      {sortedComments.length ? sortedComments.map(
        (comm, index) => {
          return(
            <Card
              key={index}
              onContextMenu={e => handleOnContextMenu(e, comm)}
            >
              <Card.Header>
                <Card.Img 
                  src={comm.avatar} 
                  style={{ width: '50px', height: '50px' }}
                />
                <Card.Text>{comm.author_username}</Card.Text>
                <Card.Text>{timestampToTime(comm.timestamp)}</Card.Text>
              </Card.Header>
              <Card.Body>
                <Card.Text>
                {">  ".repeat(comm.level) + comm.text}
                </Card.Text>
              </Card.Body>
            </Card>
          );
        }
      ) : [
        <Card
          key={0}
        >
          <Card.Body>
            Ви можете стати першим, хто дасть відповідь на це повідомлення!
          </Card.Body>
        </Card>
      ]}
    </ul>
  );
}