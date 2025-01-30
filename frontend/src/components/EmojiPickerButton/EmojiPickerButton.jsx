import React from "react";
import sendSmileIcon from "../../assets/send-smile.svg";
import EmojiPicker from "emoji-picker-react";
import "./EmojiPickerButton.css";

export default function EmojiPickerButton({ setText }) {
  const handleEmojiClick = emojiData => {
    console.log(emojiData.emoji);
    setText(prev => prev + emojiData.emoji);
  };

  return (
    <div className="send-smile-container">
      <div className="send-smile-btn">
        <img src={sendSmileIcon} alt="Smile" />
      </div>
      <div className="invisible-gap"></div>
      <div className="emoji-picker">
        <EmojiPicker onEmojiClick={handleEmojiClick} height={400} width={300} />
      </div>
    </div>
  );
}
