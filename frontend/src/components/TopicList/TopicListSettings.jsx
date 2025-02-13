import React from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import CreateTopicButton from "./CreateTopicButton";
import "./TopicList.css";

export default function TopicListSettings({ sortOrder, handleChange }) {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
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
        {currentUser ? <option value="subs">{t("topic.subs")}</option> : null}
      </select>
    </div>
  );
}
