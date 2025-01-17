import React, { useState, useEffect } from "react";
import { Container, Card } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext.jsx";
import AttachedFiles from "../AttachedFiles/AttachedFiles.jsx";
import { timestampToTime } from "../../utils/getCurrentTime.jsx";
import ProfileHeader from "../ProfileHeader.jsx";
import "./Comments.css";

export default function TopicComments({
  handleOnContextMenu,
  comments,
  currentUser,
  uid,
}) {
  let sortedComments = comments;
  sortedComments.sort((a, b) => {
    // ще не готово
    if (a.reply === b.id) {
      return 1;
    }
    if (a.reply === b.reply) {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
  return (
    <ul
      style={{
        display: "flex",
        width: "100%",
        flexDirection: "column-reverse",
      }}
    >
      {sortedComments.length
        ? sortedComments.map((comment, index) => {
            return (
              <div
                key={index}
                className="comment-outer"
                style={
                  currentUser?.uid === comment.author_id
                    ? {
                        textAlign: "right",
                        marginLeft: "auto",
                        marginRight: "2vh",
                      }
                    : {
                        textAlign: "left",
                        marginRight: "auto",
                        marginLeft: "2vh",
                      }
                }
                onContextMenu={e => handleOnContextMenu(e, comment)}
              >
                <ProfileHeader
                  id={comment.author_id}
                  avatar={comment.avatar}
                  profileName={
                    comment.author_username +
                    (uid === comment.author_id ? "(Автор)" : "")
                  }
                  sizeFont="2vh"
                  size="4vh"
                />
                <span>{comment.text}</span>
                <br />
                <span>{timestampToTime(comment.timestamp)}</span>
              </div>
            );
          })
        : [
            <Card key={0}>
              <Card.Body>
                Ви можете стати першим, хто дасть відповідь на це повідомлення!
              </Card.Body>
            </Card>,
          ]}
    </ul>
  );
}
