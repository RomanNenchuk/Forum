import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTopicSearch } from "../../contexts/TopicSearchContext.jsx";
import ProfileHeader from "../ProfileHeader";
import logo from "../../assets/logo.svg";
import seachIcon from "../../assets/search.svg";
import "./Menu.css";

export default function TopBar({ currentUser, avatar, fullName }) {
  const location = useLocation();
  const {
    searchInput,
    setSearchInput,
    setQueryParams,
    urlSearchParams,
    setUrlSearchParams,
    getTagList,
    getSearchInputData,
  } = useTopicSearch();
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    navigate("/");
    const { tagList, authorList } = getSearchInputData();
    urlSearchParams.delete("tags");
    urlSearchParams.delete("authors");

    if (tagList) urlSearchParams.set("tags", tagList);
    if (authorList) urlSearchParams.set("authors", authorList);
    if (tagList || authorList) {
      setUrlSearchParams(urlSearchParams);
    }
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
            setQueryParams({
              page: 1,
              sortOrder: "desc",
              tags: "",
            });
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
              placeholder="Я шукаю..."
            />
            <button className="hd-search-btn" type="submit">
              <span>Знайти</span>
            </button>
          </form>
        </div>
        <div className="hd-col">
          {currentUser ? (
            <ProfileHeader
              id={currentUser.uid}
              avatar={avatar}
              profileName={`Вітаємо, ${fullName}!`}
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
              to="/login"
              state={{ backgroundLocation: location, redirectPath: location }}
            >
              <button className="hd-btn">
                Вхід
                <div className="hd-btn-sep">
                  <span> | </span>
                </div>
                Реєстрація
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
