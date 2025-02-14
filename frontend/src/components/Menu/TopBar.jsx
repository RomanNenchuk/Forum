import React from "react";
import { useUserInfo } from "../../contexts/UserInfoContext";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTopicSearch } from "../../contexts/TopicSearchContext.jsx";
import ProfileHeader from "../ProfileHeader";
import logo from "../../assets/logo.svg";
import seachIcon from "../../assets/search.svg";
import "./Menu.css";

export default function TopBar() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const location = useLocation();
  const {
    searchInput,
    setSearchInput,
    urlSearchParams,
    setUrlSearchParams,
    getSearchInputData,
  } = useTopicSearch();
  const navigate = useNavigate();
  const { user } = useUserInfo();

  function handleSearch(e) {
    e.preventDefault();
    const result = getSearchInputData();
    urlSearchParams.delete("tags");
    urlSearchParams.delete("authors");

    if (result?.tagList?.length > 0)
      urlSearchParams.set("tags", result.tagList);
    if (result?.authorList?.length > 0)
      urlSearchParams.set("authors", result.authorList);

    navigate({
      pathname: "/",
      search: urlSearchParams.toString(),
    });
  }

  return (
    <header>
      <div className="header-inr">
        <Link
          to="/"
          className="hd-col home-link"
          onClick={() => {
            setUrlSearchParams({});
            setSearchInput("");
          }}
        >
          <div className="hd-logo">
            <img src={logo} alt="UFORUM" />
            <span>
              <span>U</span>FORUM
            </span>
          </div>
        </Link>
        <div className="hd-col">
          <form className="hd-search" onSubmit={handleSearch}>
            <img src={seachIcon} alt="Search" />
            <input
              className="hd-search-input"
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder={t("menu.searchPlaceholder")}
            />
            <button className="hd-search-btn" type="submit">
              <span>{t("menu.searchButton")}</span>
            </button>
          </form>
        </div>
        <div className="hd-col">
          {currentUser && user ? (
            <ProfileHeader
              id={currentUser.uid}
              avatar={user?.avatar}
              profileName={`${t("menu.welcomeMessage")} ${
                user?.fullName || "user"
              }!`}
              size="9vh"
              sizeFont="3vh"
              avThickness="0.4vh"
              gap="1.5vh"
              order="text-first"
              style={{ textAlign: "right" }}
              textStyle={{ color: "#000" }}
            />
          ) : (
            <Link
              to={`/login${location.search}`}
              state={{
                backgroundLocation: {
                  pathname: location.pathname,
                  search: location.search,
                },
                redirectPath: location,
              }}
            >
              <button className="hd-btn">
                {t("menu.logIn")}
                <div className="hd-btn-sep">
                  <span> | </span>
                </div>
                {t("menu.signUp")}
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
