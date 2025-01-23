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
  sortedComments.sort((a, b) => { // default sort
    let ta = (a.reply === -1 ? a.timestamp : a.reply_timestamp),
        tb = (b.reply === -1 ? b.timestamp : b.reply_timestamp);
    if (ta === tb) {
      return new Date(ta).getTime() - new Date(tb).getTime();
    } else {
      return new Date(tb).getTime() - new Date(ta).getTime();
    }
  });
  return (
    <ul
      style={{
        width: "100%",
      }}
    >
      {sortedComments.length
        ? sortedComments.map((comment, index) => {
            return (
              <div
                key={index}
                className={`comment-outer${ comment.reply === -1 ? "" : "-reply" }`
                }
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
                <AttachedFiles
                  urls={comment?.attachments}
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
