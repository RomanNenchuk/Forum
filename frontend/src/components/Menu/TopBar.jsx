import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTopicSearch } from "../../contexts/TopicSearchContext.jsx";
import { useWidth } from "../../contexts/ScreenWidthContext.jsx";
import { MdMenu } from "react-icons/md";
import { IoIosSearch } from "react-icons/io";
import { PiDotsThreeCircleVerticalFill } from "react-icons/pi";
import ProfileHeader from "../ProfileHeader";
import logo from "../../assets/logo.svg";
import seachIcon from "../../assets/search.svg";
import "./Menu.css";
import Avatar from "../Avatar.jsx";

export default function TopBar({ currentUser, avatar, fullName, setExpand }) {
  const location = useLocation();
  const {
    searchInput,
    setSearchInput,
    setQueryParams,
    urlSearchParams,
    setUrlSearchParams,
    getSearchInputData,
  } = useTopicSearch();
  const navigate = useNavigate();

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
  const { width } = useWidth()

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
              authors: "",
            });
          }}
        >
          <div className="hd-logo">
            {width > 768 ? (<img src={logo} alt="UFORUM" />) : (<MdMenu onClick = {()=>{setExpand(1), console.log("yes")}} size="5vh"/>)}
            <span>
              <span>U</span>FORUM
            </span>
          </div>
        </Link>
        {width > 768 ? (<><div className="hd-col">
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
          </div></>) : (<>
            <div style = {{display: "flex", flexDirection: "row",alignItems: "center"}}>
            {!currentUser ? (<Link
                to="/login"
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
                </button>
              </Link>) : (
                <div style = {{marginRight: "2vh"}}><Avatar avatar={avatar} size="5vh" /></div>
              )}
              <IoIosSearch size = "5vh" />
              <PiDotsThreeCircleVerticalFill size = "5vh"/>
            </div>
          </>)}
        
      </div>
    </header>
  );
}
