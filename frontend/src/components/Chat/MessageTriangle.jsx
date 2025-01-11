import React from "react";

export default function MessageTriangle({ isSender }) {
  return (
    <div
      className="mes-triangle"
      style={
        isSender
          ? {
              bottom: "-25px",
              right: "-17px",
              backgroundColor: "#a3beb7",
              transform: "rotate(135deg)",
            }
          : {
              bottom: "-25px",
              left: "-17px",
              backgroundColor: "gray",
              transform: "rotate(225deg)",
            }
      }
    ></div>
  );
}
