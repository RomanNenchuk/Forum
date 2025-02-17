import axios from "axios";

export const fetchMyTopics = async ({ pageParam = 1, userId }) => {
  try {
    const response = await axios.get(`http://localhost:5000/topics/mytopics`, {
      params: { user_id: userId, page: pageParam },
    });

    const topics =
      response.data?.map(topic => ({
        ...topic,
        subscribed: "none",
      })) || [];

    return {
      topics,
      hasMore: topics.length > 0, // Позначаємо, чи є ще теми
      nextPage: topics.length > 0 ? pageParam + 1 : undefined, // Передаємо наступну сторінку, якщо є ще дані
    };
  } catch (error) {
    console.error("Error fetching user topics:", error);
    throw error;
  }
};

export const fetchSavedTopics = async ({ pageParam = 1, userId }) => {
  try {
    const response = await axios.get(`http://localhost:5000/topics/saved`, {
      params: { user_id: userId, page: pageParam },
    });

    const topics = response.data || [];

    return {
      topics,
      hasMore: topics.length > 0, // Позначаємо, чи є ще теми
      nextPage: topics.length > 0 ? pageParam + 1 : undefined, // Передаємо наступну сторінку, якщо є ще дані
    };
  } catch (error) {
    console.error("Error fetching saved topics:", error);
    throw error;
  }
};

export const switchSavedTopic = async ({ user_id, topic }) => {
  console.log(user_id, topic);
  const res = await axios.patch(`http://localhost:5000/topics/switch`, {
    user_id,
    topic_id: topic?.id,
  });
  return res.data;
};

export const fetchTopics = async ({ pageParam = 1, queryKey }) => {
  const [, queryParams, userId] = queryKey; // Дістаємо queryParams
  try {
    const response = await axios.get(`http://localhost:5000/topics`, {
      params: {
        page: pageParam,
        sort: queryParams?.sortOrder || "desc",
        user_id: userId || undefined,
        tags: queryParams?.tags || undefined,
        authors: queryParams?.authors || undefined,
      },
    });
    const topics = response.data || [];

    return {
      topics,
      hasMore: topics.length > 0, // Позначаємо, чи є ще теми
      nextPage: topics.length > 0 ? pageParam + 1 : undefined, // Передаємо наступну сторінку, якщо є ще дані
    };
  } catch (error) {
    console.error(error);
  }
};
