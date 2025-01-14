export default function scrollToBottom(element) {
  element.scrollTo({
    top: element.scrollHeight,
    behavior: "smooth",
  });
}
