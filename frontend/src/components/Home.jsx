import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";

const styles = {
  li: {
    listStyle: "none",
    padding: "16px",
    margin: "8px 0",
    border: "2px solid #FFD700",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    backgroundColor: "#FFF",
    fontFamily: "Arial, sans-serif",
    maxWidth: "400px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: "8px",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#DDD",
    marginRight: "8px",
  },
  username: {
    color: "#555",
    fontWeight: "bold",
  },
  content: {
    marginBottom: "12px",
    fontSize: "14px",
    color: "#333",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "18px",
  },
  icon: {
    cursor: "pointer",
    marginRight: "8px",
  },
};

export default function Home() {
  const [topicList, setTopicList] = useState([]);
  const { token } = useAuth();

  async function fetchTopics() {
    try {
      const response = await axios.get("http://localhost:5000/topics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      const topics = Array.isArray(response.data)
        ? response.data
        : response.data.topics || [];
      setTopicList(topics);
      console.log(topics);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchTopics();
  }, []);

  return (
    <ul>
      {topicList.map((item, index) => (
        <li style={styles.li} key={index}>
          <div style={styles.header}>
            <img
              src={item.avatar || "/default-avatar.png"}
              alt="User Avatar"
              className="profile-image"
              style={{
                height: "40px",
                border: "0",
                marginRight: "10px",
              }}
            />
            <span style={styles.username}>{item.username}</span>
          </div>
          <div style={styles.content}>
            <p>{item.title}</p>
          </div>
          <div style={styles.footer}>
            <span style={styles.icon}>👍</span>
            <span style={styles.icon}>👎</span>
            <span style={styles.icon}>❤️</span>
            <span style={styles.icon}>😊</span>
            <span style={styles.icon}>⚙️</span>
          </div>
        </li>
      ))}
    </ul>
    // <h1>
    //   Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis, inventore?
    //   Cumque repudiandae explicabo optio, sit pariatur repellat, consequatur
    //   dolore iure aut libero beatae! Odio quasi corporis libero ducimus
    //   excepturi eveniet. Lorem ipsum dolor, sit amet consectetur adipisicing
    //   elit. Voluptatibus temporibus eius quo reprehenderit minima est culpa
    //   aliquam nemo ullam deleniti iure, voluptatem a soluta repudiandae
    //   perspiciatis assumenda modi aliquid aperiam! Lorem ipsum, dolor sit amet
    //   consectetur adipisicing elit. Eaque eligendi vero minus amet quae
    //   exercitationem aut unde delectus voluptatem repudiandae consequatur sed
    //   mollitia dicta at, rem necessitatibus! Beatae, minus provident! Lorem
    //   ipsum dolor sit amet consectetur adipisicing elit. Nisi, obcaecati dolore
    //   nobis suscipit a velit dolor repudiandae sapiente odit similique earum
    //   corrupti, vitae quia illo rem molestiae explicabo, neque sunt. Lorem ipsum
    //   dolor sit amet consectetur adipisicing elit. Doloribus ex nisi minus
    //   perferendis autem pariatur, temporibus vel quas asperiores, aliquid illo
    //   distinctio consectetur exercitationem, cupiditate facilis voluptatum quos.
    //   Ab, eligendi?
    // </h1>
  );
}
