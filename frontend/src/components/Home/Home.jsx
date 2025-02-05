import React, { useEffect, useState, useRef } from "react";
import { useTopicSearch } from "../../contexts/TopicSearchContext.jsx";
import LoadingSpinner from "../Spinner.jsx";
import TopicListSettings from "../TopicList/TopicListSettings.jsx";
import TopicList from "../TopicList/TopicList.jsx";
import TagBar from "../TagBar/TagBar.jsx";
import "./Home.css";
import { useTopicList } from "../../contexts/TopicListContext.jsx";

export default function Home() {
  const [tagBarLoading, setTagBarLoading] = useState(true);
  const topicListRef = useRef(null);
  const { queryParams, setQueryParams, urlSearchParams, setUrlSearchParams } =
    useTopicSearch();

  const { hasMore, loading, topicInfoList, debounce } = useTopicList();

  const handleChange = e => {
    const newSortOrder = e.target.value;
    urlSearchParams.set("sort", newSortOrder);
    setUrlSearchParams(urlSearchParams);
    // скидання сторінки при зміні сортування
    setQueryParams(prev => ({
      ...prev,
      sortOrder: newSortOrder,
      page: 1,
    }));
  };

  function loadMore() {
    setQueryParams(prev => ({
      ...prev,
      page: prev.page + 1,
    }));
  }

  useEffect(() => {
    const handleScroll = () => {
      const targetElement = document.querySelector(".forum-container");
      const elementHeight = targetElement ? targetElement.offsetHeight : 0;
      const totalHeight =
        window.innerHeight + document.documentElement.scrollTop;
      const documentHeight = Math.max(
        document.documentElement.offsetHeight,
        elementHeight
      );

      if (totalHeight >= documentHeight - 200 && hasMore && !loading) {
        loadMore();
      }
    };

    const debouncedHandleScroll = debounce(handleScroll, 200);
    window.addEventListener("scroll", debouncedHandleScroll);
    return () => window.removeEventListener("scroll", debouncedHandleScroll);
  }, [hasMore, loading]);

  useEffect(() => {
    const savedPosition = sessionStorage.getItem("scrollPosition");
    if (savedPosition) {
      window.scrollTo({
        top: parseInt(savedPosition, 10),
        left: 0,
        behavior: "instant",
      });
      sessionStorage.removeItem("scrollPosition");
    }
  }, []);

  if (loading && tagBarLoading && topicInfoList.length === 0)
    return <LoadingSpinner />;

  return (
    <>
      <ul className="submain-in" ref={topicListRef}>
        <TopicListSettings
          sortOrder={queryParams.sortOrder}
          handleChange={handleChange}
        />
        <TopicList topicInfoList={topicInfoList} />
      </ul>
      <TagBar
        tagBarLoading={tagBarLoading}
        setTagBarLoading={setTagBarLoading}
      />
    </>
  );
}
