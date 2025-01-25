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

export function formatRelativeTime(pgTimestamp) {
  const date = new Date(pgTimestamp); // час, взятий з коментаря
  const now = new Date(); // час зараз

  const diffInMs = now - date;
  const diffInSec = Math.floor(diffInMs / 1000);
  const diffInMin = Math.floor(diffInSec / 60);
  const diffInHours = Math.floor(diffInMin / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365.25);

  if (diffInDays === 0) {
    return "Сьогодні";
  } else if (diffInDays === 1) {
    return "Вчора";
  } else if (diffInDays < 5) {
    return `${diffInDays} дні тому`;
  } else if (diffInDays < 7) {
    return `${diffInDays} днів тому`;
  } else if (diffInDays < 30) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? "тиждень" : "тижні"} тому`;
  } else if (diffInMonths < 5) {
    return `${diffInMonths} ${diffInMonths === 1 ? "місяць" : "місяці"} тому`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} місяців тому`;
  } else if (diffInYears < 5) {
    return `${diffInYears} ${diffInYears === 1 ? "рік" : "роки"} тому`;
  } else {
    return `${diffInYears} років тому`;
  }
}
