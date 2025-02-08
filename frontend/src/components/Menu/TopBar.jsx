import React, { useEffect } from "react";
import { useUserInfo } from "../../contexts/UserInfoContext";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTopicSearch } from "../../contexts/TopicSearchContext.jsx";
import ProfileHeader from "../ProfileHeader";
import logo from "../../assets/logo.svg";
import seachIcon from "../../assets/search.svg";
import "./Menu.css";

export default function TopBar() {
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

  useEffect(() => {
    console.log(user);
  }, [user]);

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
              avatar={user?.avatar}
              profileName={`Вітаємо, ${user?.fullName}!`}
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
