export function getFormattedTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function timestampToTime(timestamp) {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid timestamp format");
    }
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error("Error formatting timestamp:", error.message);
    return null;
  }
}
