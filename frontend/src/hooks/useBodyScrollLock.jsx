import { useEffect } from "react";

export function useBodyScrollLock(isLocked) {
  useEffect(() => {
    const element = document.querySelector(".chat-messages");
    if (isLocked) {
      const fullWidth = element.offsetWidth;
      // Ширина контентної області без прокрутки
      const contentWidth = element.clientWidth;
      // Ширина скролбара
      const scrollBarWidth = fullWidth - contentWidth;

      element.style.overflow = "hidden";
      element.style.paddingRight = `${scrollBarWidth}px`; // Компенсація
    } else {
      element.style.overflowY = "auto";
      element.style.paddingRight = ""; // Скидаємо відступ
    }

    return () => {
      element.style.overflowY = "auto";
      element.style.paddingRight = ""; // Скидаємо відступ при демонтованому компоненті
    };
  }, [isLocked]);
}
