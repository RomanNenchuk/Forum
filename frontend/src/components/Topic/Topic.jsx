import React, { useState, useEffect } from "react";
import { Container, Card, Carousel } from "react-bootstrap";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useUserInfo } from "../../contexts/UserInfoContext";
import ProfileHeader from "../ProfileHeader";
import LoadingSpinner from "../Spinner";
import TopicList from "../TopicList/TopicList";
import TopicInput from "./TopicInput";
import TopicComments from "./TopicComments";
import "./Topic.css";

import { IoArrowBack } from "react-icons/io5";
import axios from "axios";

export default function Topic() {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigator = useNavigate();
  const [extendfInfo, setExtendInfo] = useState();

  const [text, setText] = useState("");
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]); // Список файлів на видалення
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [editId, setEditId] = useState(-1);
  const [replyId, setReply] = useState(-1);

  const { currentUser } = useAuth();
  const { userName, avatar } = useUserInfo();
  // вантажу інформацію з БД при монтуванні компонента
  useEffect(() => {
    document.body.classList.add("body-overflow");
    setLoading(true);
    fetchTopic();
    fetchTopicComments();
    document.body.classList.remove("body-overflow");
  }, [id]);

  async function fetchTopic() {
    try {
      const result = await axios.get(`http://localhost:5000/topics/${id}`);
      let buf = result.data;
      buf.author_avatar = buf.avatar;
      buf.author_full_name = buf.authorfullname;
      delete buf.avatar;
      delete buf.authorfullname;
      setTopic(buf);
      setExtendInfo(buf?.description?.length < 150 ? 2 : 0);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTopicComments() {
    try {
      /* має бути таким же, як і comm з sendComment
      id
      text
      timestamp
      author_id
      topic_id
      attachments
      reply
      reply_text
      author_username
      avatar
       */
      const result = await axios.get(
        `http://localhost:5000/topics/${id}/comments`
      );
      setComments(result.data);
      console.log(result.data);
    } catch (error) {
      console.error("fetchTopicComments error:", error);
    }
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setIsSendModalOpen(false);
    setEditId(-1);
    setText("");
  };

  function resetReply() {
    setReply(-1);
  }

  async function sendComment() {
    if (files.length === 0 && text.trim() !== "") {
      const comm = {
        // має бути таким же, як і result.data з fetchTopicComents
        id: -1,
        text: text.trim(),
        timestamp: new Date().toISOString(),
        author_id: currentUser.uid,
        topic_id: id,
        attachment: [],
        reply: replyId,
        reply_text: "",
        author_username: userName,
        author_avatar: avatar,
      };
      const result = await axios.post(
        `http://localhost:5000/topics/comments`,
        comm
      );
      comm.id = result.data.id;
      comm.reply_text = result.data.reply_text;
      console.log(comm);
      setComments(prev => [comm, ...prev]);
      setText("");
      resetReply();
      return;
    }

    // якщо користувач обере більше 10 файлів, то розбиваємо їх на частини по 10
    const CHUNK_SIZE = 10;
    const fileChunks = [];
    for (let i = 0; i < files.length; i += CHUNK_SIZE) {
      fileChunks.push(files.slice(i, i + CHUNK_SIZE));
    }

    for (let i = 0; i < fileChunks.length; i++) {
      const chunk = fileChunks[i];
      const attachments = await handleUpload(chunk);

      const msg = {
        id: -1,
        attachments,
        userName: userName,
        sender_id: currentUser.uid,
        text: text.trim(),
        timestamp: new Date().toISOString(),
        reply: replyId,
      };

      socket.emit("send-message", msg, receiverId, res => {
        msg.id = res.id;
        msg.reply_text = res.reply_text;
        setMessages(prev => [...prev, msg]);

        if (i === fileChunks.length - 1) {
          setText("");
          setFiles([]);
        }
      });
      setIsSendModalOpen(false);
    }
    resetReply();
  }
  async function editComment() {
    alert("edit");
  }
  if (loading) return <LoadingSpinner />;

  return (
    <div className="extention-area">
      <div className="header">
        <IoArrowBack
          onClick={() => {
            navigator("/");
          }}
          size={30}
        />
        <span>Дискусія</span>
      </div>
      <div className="topic-and-comments">
        <div className="in-block-for-flex">
          <div className="block left">
            <div className="info-list">
              <TopicList topicInfoList={[topic]} />

              <div className="extra-info">
                <div style={{ padding: "2vh" }}>
                  <span className="extra-info-header">
                    Додаткова інформація
                  </span>
                  <span
                    className="extra-info-p"
                    onClick={() => {
                      console.log(currentUser);
                    }}
                  >
                    {extendfInfo === 2 ? (
                      topic?.description
                    ) : extendfInfo === 1 ? (
                      <>
                        {topic?.description}
                        <span
                          className="extention-info"
                          onClick={() => setExtendInfo(0)}
                        >
                          Показати менше
                        </span>
                      </>
                    ) : (
                      <>
                        {topic?.description?.slice(0, 152)}
                        <span
                          className="extention-info"
                          onClick={() => setExtendInfo(1)}
                        >
                          ... Дізнатися більше
                        </span>
                      </>
                    )}
                  </span>
                  {extendfInfo && topic.attachments.length > 0 && (
                    <Container fluid>
                      <Carousel
                        style={{ padding: "2vh" }}
                        className="carousel slide carousel-fade"
                      >
                        {topic.attachments.map((attachment, index) => (
                          <Carousel.Item key={index}>
                            <img
                              className="d-block w-100"
                              src={attachment}
                              alt={`Slide ${index + 1}`}
                              onClick={() =>
                                console.log(`Clicked on slide ${index + 1}`)
                              }
                            />
                          </Carousel.Item>
                        ))}
                      </Carousel>
                    </Container>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="palka"></div>

          <div className="block right">
            <div style={{ width: "100%" }}>
              <div className="comment-area">Коментарі</div>
              <ul>
                <TopicComments
                  handleOnContextMenu={() => {}}
                  uid={topic.uid}
                  comments={comments}
                  getComment={() => "*Unknown comment*"}
                  getUseruserName={() => "*Unknown user*"}
                />
              </ul>
              <div style={{ position: "sticky", bottom: "0px" }}>
                <TopicInput
                  isEditModalOpen={isEditModalOpen}
                  isSendModalOpen={isSendModalOpen}
                  setIsEditModalOpen={setIsEditModalOpen}
                  setIsSendModalOpen={setIsSendModalOpen}
                  setFiles={setFiles}
                  text={text}
                  setText={setText}
                  sendComment={
                    currentUser
                      ? sendComment
                      : () => {
                          navigator("/login");
                        }
                  }
                  editComment={editComment}
                  editId={editId}
                  onCancel={handleCloseModal}
                  replyId={replyId}
                  resetReply={resetReply}
                  getComment={() => "*Unknown comment*"}
                  getUseruserName={() => "*Unknown user*"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
