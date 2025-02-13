import React from "react";
import { useTranslation } from "react-i18next";
import CreateTopicButton from "./CreateTopicButton";
import "./TopicList.css";

export default function TopicListSettings({ sortOrder, handleChange }) {
  const { t } = useTranslation();
  return (
    <div className="top-button">
      <CreateTopicButton />
      <select
        className="dropdown-button"
        value={sortOrder}
        onChange={handleChange}
      >
        <option value="desc">{t("topic.newest")}</option>
        <option value="asc">{t("topic.oldest")}</option>
        <option value="rating">{t("topic.topRated")}</option>
      </select>
    </div>
  );
}
