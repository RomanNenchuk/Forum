import React, { useMemo } from "react";
import { Card } from "react-bootstrap";
import AttachedFiles from "../AttachedFiles/AttachedFiles.jsx";
import {
  timestampToTime,
  formatRelativeTime,
} from "../../utils/getCurrentTime.jsx";
import ProfileHeader from "../ProfileHeader.jsx";
import "./Comments.css";

export default function TopicComments({
  handleOnContextMenu,
  comments,
  currentUser,
  uid,
}) {
  const sortedComments = useMemo(() => {
    const temp = [...comments].sort((a, b) => {
      // default sort
      let ta = a.reply === -1 ? a.timestamp : a.reply_timestamp,
        tb = b.reply === -1 ? b.timestamp : b.reply_timestamp;
      if (ta === tb) {
        return new Date(ta).getTime() - new Date(tb).getTime();
      } else {
        return new Date(tb).getTime() - new Date(ta).getTime();
      }
    });
    console.log(temp);
    return temp;
  }, [comments]);

  return (
    <ul className="topic-comments">
      {sortedComments.length ? (
        sortedComments.map((comment, index) => {
          return (
            <div
              key={index}
              className={`comment-outer${comment.reply === -1 ? "" : "-reply"}`}
              onContextMenu={e => handleOnContextMenu(e, comment)}
            >
              <div className="header-container">
                <ProfileHeader
                  id={comment.author_id}
                  avatar={comment.avatar}
                  profileName={
                    comment.author_fullname +
                    (uid === comment.author_id ? "(Автор)" : "")
                  }
                  textStyle={{ color: "#000" }}
                  sizeFont="16px"
                  size="37px"
                />
                <span className="header-delimiter">•</span>
                <span className="comment-timestamp">
                  {formatRelativeTime(comment.timestamp)}
                </span>
              </div>
              <AttachedFiles urls={comment?.attachments} />
              <p className="comment-text">{comment.text}</p>
            </div>
          );
        })
      ) : (
        <Card>
          <Card.Body>
            Ви можете стати першим, хто дасть відповідь на це повідомлення!
          </Card.Body>
        </Card>
      )}
    </ul>
  );
}
