import React, { useEffect } from "react";

export function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (isLocked) {
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`; // Компенсація
    } else {
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = ""; // Скидаємо відступ
    }

    return () => {
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = ""; // Скидаємо відступ при демонтованому компоненті
    };
  }, [isLocked]);
}
