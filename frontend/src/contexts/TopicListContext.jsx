import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { useTopicSearch } from "./TopicSearchContext";

const TopicListContext = createContext();

export function useTopicList() {
  return useContext(TopicListContext);
}

export function TopicListProvider({ children }) {
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const value = {
    hasMore,
    loading,
  };

  return (
    <TopicListContext.Provider value={value}>
      {children}
    </TopicListContext.Provider>
  );
}
