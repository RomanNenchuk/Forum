import React, { useState, useEffect, useRef } from "react";
import { Container, Card, Carousel } from "react-bootstrap";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useUserInfo } from "../../contexts/UserInfoContext";
// import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.jsx";
import ProfileHeader from "../ProfileHeader";
import LoadingSpinner from "../Spinner";
import TopicList from "../TopicList/TopicList";
import TopicInput from "./TopicInput";
import TopicComments from "./TopicComments";
import "./Topic.css";

import { IoArrowBack } from "react-icons/io5";
import TopicContextMenu from "./TopicContextMenu";
import axios from "axios";

export const commentsOnOnePageCount = 10;

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

  // useBodyScrollLock(isContextMenuOpen);
  const [files, setFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]); // Список файлів на видалення
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [editId, setEditId] = useState(-1);
  const [reply, setReply] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    selectedComment: -1,
    selectedCommentItem: null,
    position: {
      x: 0,
      y: 0,
    },
    toggled: false,
  });

  const contextMenuRef = useRef(null);
  const { currentUser } = useAuth();
  const { userName, avatar } = useUserInfo();

  // вантажу інформацію з БД при монтуванні компонента
  useEffect(() => {
    // document.body.classList.add("body-overflow");
    setLoading(true);
    fetchTopic();
    fetchTopicComments();
    // document.body.classList.remove("body-overflow");
  }, [id]);
  // обробник кліку на сторінці
  useEffect(() => {
    function handler(e) {
      if (contextMenuRef.current) {
        if (!contextMenuRef.current.contains(e.target)) {
          resetContextMenu();
        }
      }
    }
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  async function fetchTopic() {
    try {
      const result = await axios.get(
        `http://localhost:5000/topics/${id}${
          currentUser ? "?user_id=" + currentUser.uid : ""
        }`
      );
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
        author_username
        avatar
        reply_text
        reply_timestamp
       */
      const result = await axios.get(
        `http://localhost:5000/topics/${id}/comments`
      );
      console.log(result.data);
      setComments(result.data);
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
    setReply(null);
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
        reply: reply?.id || -1,
        author_username: userName,
        avatar: avatar,
        reply_text: null,
        reply_timestamp: reply?.timestamp || null,
      };
      const result = await axios.post(
        `http://localhost:5000/topics/comments`,
        comm
      );
      comm.id = result.data.id;
      comm.reply_text = result.data.reply_text;

      setComments(prev => [...prev, comm]);
      setText("");
      resetReply();
      return;
    }

    // якщо користувач обере більше 10 файлів, то розбиваємо їх на частини по 10
    // const CHUNK_SIZE = 10;
    // const fileChunks = [];
    // for (let i = 0; i < files.length; i += CHUNK_SIZE) {
    //   fileChunks.push(files.slice(i, i + CHUNK_SIZE));
    // }

    // for (let i = 0; i < fileChunks.length; i++) {
    //   const chunk = fileChunks[i];
    //   const attachments = await handleUpload(chunk);

    //   const msg = {
    //     id: -1,
    //     attachments,
    //     userName: userName,
    //     sender_id: currentUser.uid,
    //     text: text.trim(),
    //     timestamp: new Date().toISOString(),
    //     reply: reply,
    //   };

    //   socket.emit("send-message", msg, receiverId, res => {
    //     msg.id = res.id;
    //     msg.reply_text = res.reply_text;
    //     setMessages(prev => [...prev, msg]);

    //     if (i === fileChunks.length - 1) {
    //       setText("");
    //       setFiles([]);
    //     }
    //   });
    //   setIsSendModalOpen(false);
    // }
    // resetReply();
  }

  async function editComment() {
    try {
      let newComm;
      let newComments = comments.map(comm => {
        if (comm.id === editId) {
          if (comm.attachments) {
            // тут буде реалізаці едіту вкладень
          }
          newComm = {
            ...comm,
            text: comm.attachments ? text : text || comm.text,
            //attachments:
          };
          return newComm;
        }
        return comm;
      });

      setEditId(-1);
      setText("");
      if (newComm) {
        setComments(newComments);
        await axios.patch(
          `http://localhost:5000/topics/comments/${editId}`,
          newComm
        );
      }
    } catch (error) {
      console.error("Error with editComment: ", error);
    }
  }

  async function deleteComment(commId) {
    try {
      // для видалення файлів повідомлення (треба дописати)
      const attach = await axios.delete(
        `http://localhost:5000/topics/comments/${commId}`
      );
      for (const comm of comments) {
        if (comm.id === commId) {
          setComments(prev => prev.filter(item => item.id !== commId));
          break;
        }
      }
    } catch (error) {
      console.error("Error with deleteComment:", error);
    }
  }

  function resetContextMenu() {
    setIsContextMenuOpen(false);
    setContextMenu({
      selectedComment: -1,
      selectedCommentItem: null,
      position: {
        x: 0,
        y: 0,
      },
      toggled: false,
    });
  }

  function handleOnContextMenu(e, comm) {
    e.preventDefault();
    const contextMenuAttr = contextMenuRef.current.getBoundingClientRect();

    const isRight = e.clientX > window?.innerWidth / 2;
    const isBottom = e.clientY > window?.innerHeight / 2;

    let x = e.clientX;
    let y = e.clientY;

    if (isRight) x -= contextMenuAttr.width;
    if (isBottom) y -= contextMenuAttr.height;
    setFilesToDelete([]);
    setFiles([]);
    setIsContextMenuOpen(true);

    setContextMenu({
      selectedComment: comm.id,
      selectedCommentItem: comm,
      position: {
        x,
        y,
      },
      toggled: true,
    });
  }
  useEffect(() => {
    console.log(reply?.id);
  }, [reply]);

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

          <div className="palka"></div>

          <div className="block right">
            <div style={{ width: "100%" }}>
              <div className="comment-area">Коментарі</div>
              <ul>
                <TopicComments
                  handleOnContextMenu={handleOnContextMenu}
                  uid={topic?.uid}
                  currentUser={currentUser}
                  comments={comments}
                />
              </ul>
            </div>
          </div>
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
            reply={reply}
            resetReply={resetReply}
          />
          <TopicContextMenu
            positionX={contextMenu.position.x}
            positionY={contextMenu.position.y}
            isToggled={contextMenu.toggled}
            contextMenuRef={contextMenuRef}
            resetContextMenu={resetContextMenu}
            currentUser={currentUser}
            contextMenu={contextMenu}
            deleteComment={deleteComment}
            setEditId={setEditId}
            setText={setText}
            setReply={setReply}
          />
        </div>
      </div>
    </div>
  );
}
