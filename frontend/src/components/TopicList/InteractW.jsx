import React, { useRef, useState } from "react";
import { MdArrowBackIosNew } from "react-icons/md";
import { MdArrowForwardIos } from "react-icons/md";

/*
 */

export default function interact_window({ emolist }) {
  const [showLeftArrow, setLeft] = useState(false);
  const [showRightArrow, setRight] = useState(true);

  const emoRef = React.createRef(null);

  function handleScroll() {
    const emoWindow = emoRef.current;
    if (emoWindow) {
      setLeft(emoWindow.scrollLeft > 10);
      setRight(emoWindow.clientWidth - emoWindow.scrollLeft - 100 > 10);
    }
  }

  return (
    <div className="interact_emo_window">
      <div className="outer_interact">
        {showLeftArrow && <MdArrowBackIosNew size="3vh" />}
        <div className="in_interact" ref={emoRef} onScroll={handleScroll}>
          {emolist.map((el, index) => (
            <span key={index + 1}>{el}</span>
          ))}
        </div>
        {showRightArrow && <MdArrowForwardIos size="3vh" />}
      </div>
    </div>
  );
}
