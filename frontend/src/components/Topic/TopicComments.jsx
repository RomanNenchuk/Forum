import React, { useMemo } from "react";
import { Card } from "react-bootstrap";
import CommentArea from "./CommentArea";
import "./Comments.css";

const reactionList = [
  { icon: "😁", name: "beaming_face_with_smiling_eyes" },
  { icon: "😅", name: "grinning_face_with_sweat" },
  { icon: "😎", name: "smiling_face_with_sunglasses" },
  { icon: "🤔", name: "thinking_face" },
  { icon: "😐", name: "neutral_face" },
  { icon: "😯", name: "hushed_face" },
  { icon: "😔", name: "pensive_face" },
  { icon: "😬", name: "grimacing_face" },
  { icon: "💪", name: "flexed_biceps" },
  { icon: "👌", name: "OK_hand" },
  { icon: "❤️", name: "red_heart" },
  { icon: "💔", name: "broken_heart" },
  { icon: "🙅‍♂️", name: "man_gesturing_NO" },
  { icon: "🙅‍♀️", name: "woman_gesturing_NO" },
  { icon: "🤦‍♂️", name: "man_facepalming" },
  { icon: "🤦‍♀️", name: "woman_facepalming" },
  { icon: "🤷‍♂️", name: "man_shrugging" },
  { icon: "🤷‍♀️", name: "woman_shrugging" },
  { icon: "😡", name: "enraged_face" },
  { icon: "🤡", name: "clown_face" },
  { icon: "💀", name: "skull" },
  { icon: "💩", name: "pile_of_poo" },
];

export default function TopicComments({
  handleOnContextMenu,
  comments,
  topicAuthorId,
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
    return temp;
  }, [comments]);

  return (
    <ul className="topic-comments">
      {sortedComments.length ? (
        sortedComments.map(comment => (
          <CommentArea
            key={comment.id}
            comment={comment}
            topicAuthorId={topicAuthorId}
            handleOnContextMenu={handleOnContextMenu}
            initialReactions={comment.reactions}
            userReaction={comment.user_reaction?.name}
            reactionList={reactionList}
          />
        ))
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
