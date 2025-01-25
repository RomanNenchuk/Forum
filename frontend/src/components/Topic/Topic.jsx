import React, { useState, useEffect, useRef } from "react";
import { Container, Carousel } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useUserInfo } from "../../contexts/UserInfoContext";
import handleUpload from "../../utils/uploadFiles.jsx";
import LoadingSpinner from "../Spinner";
import TopicList from "../TopicList/TopicList";
import TopicInput from "./TopicInput";
import TopicComments from "./TopicComments";
import FileSendModal from "../FileModal/FileSendModal.jsx";
import FileEditModal from "../FileModal/FileEditModal.jsx";
import { useScrollLock } from "../../hooks/useScrollLock.jsx";
import TopicContextMenu from "./TopicContextMenu";
import { IoArrowBack } from "react-icons/io5";
import axios from "axios";
import "./Topic.css";

export const commentsOnOnePageCount = 10;

export default function Topic() {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [extendfInfo, setExtendInfo] = useState();

  const [text, setText] = useState("");
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

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
  const topicCommentsRef = useRef(null);
  const topicItemRef = useRef(null);
  const { currentUser } = useAuth();
  const { userName, avatar } = useUserInfo();

  useScrollLock(isContextMenuOpen, topicCommentsRef);

  // вантажу інформацію з БД при монтуванні компонента
  useEffect(() => {
    setLoading(true);
    fetchTopic();
    fetchTopicComments();
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
      setExtendInfo(
        !buf?.description || buf?.description?.length < 150 ? 2 : 0
      );
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
        attachments: [],
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

      setComments(prev => [comm, ...prev]);
    } else {
      // якщо користувач обере більше 10 файлів, то розбиваємо їх на частини по 10
      const CHUNK_SIZE = 10;
      const fileChunks = [];
      for (let i = 0; i < files.length; i += CHUNK_SIZE) {
        fileChunks.push(files.slice(i, i + CHUNK_SIZE));
      }

      for (let i = 0; i < fileChunks.length; i++) {
        const chunk = fileChunks[i];
        const attachments = await handleUpload(chunk);

        const comm = {
          // має бути таким же, як і result.data з fetchTopicComents
          id: -1,
          text: text.trim(),
          timestamp: new Date().toISOString(),
          author_id: currentUser.uid,
          topic_id: id,
          attachments,
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

        setComments(prev => [comm, ...prev]);
      }
    }
    setText("");
    setFiles([]);
    setIsSendModalOpen(false);
    resetReply();
  }

  async function editComment() {
    try {
      const newAttachments = files.filter(file => !file.isFromDatabase);
      let newAttachmentsUrls = null;

      // Завантаження нових файлів
      if (newAttachments.length) {
        newAttachmentsUrls = await handleUpload(
          newAttachments,
          currentUser.uid
        );
      }

      let newComm;
      let newComments = comments.map(comm => {
        if (comm.id === editId) {
          let cleanedAttachments = [];
          if (comm.attachments) {
            const updatedAttachments = comm.attachments.map(attachment => {
              // Перевірка, чи потрібно замінити це вкладення
              const replacementIndex = filesToDelete.findIndex(
                file => file.url === attachment
              );
              if (replacementIndex !== -1) {
                // Якщо є заміна, беремо перший новий файл
                return newAttachmentsUrls?.shift() || null;
              }
              return attachment; // Якщо немає заміни, залишаємо оригінал
            });

            // Видаляємо всі null (вкладення, які замінилися)
            cleanedAttachments = updatedAttachments.filter(
              attachment => attachment !== null
            );

            // Якщо залишилися нові вкладення, додаємо їх у кінець
            if (newAttachmentsUrls?.length) {
              cleanedAttachments.push(...newAttachmentsUrls);
            }
          }

          newComm = {
            ...comm,
            text: comm.attachments ? text : text || comm.text,
            attachments: cleanedAttachments,
          };
          return newComm;
        }
        return comm;
      });

      setFiles([]);
      handleCloseModal();
      resetReply();
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
      await axios.delete(`http://localhost:5000/topics/comments/${commId}`);
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="extention-area">
      <div className="header">
        <IoArrowBack
          onClick={() => {
            navigate(-1);
          }}
          size={30}
        />
        <span>Дискусія</span>
      </div>
      <div className="topic-and-comments">
        <div className="in-block-for-flex">
          <div className="block left" ref={topicItemRef}>
            <div className="info-list">
              <TopicList topicInfoList={[topic]} topicListRef={topicItemRef} />
            </div>
            <div className="extra-info">
              <div style={{ padding: "2vh" }}>
                <span className="extra-info-header">Додаткова інформація</span>
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
                {extendfInfo && topic.attachments.length > 0 ? (
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
                ) : null}
              </div>
            </div>
          </div>

          <div className="palka"></div>

          <div className="palka"></div>

          <div className="block right" ref={topicCommentsRef}>
            <div style={{ width: "90%" }}>
              <div className="comment-area">Коментарі</div>
              <TopicComments
                handleOnContextMenu={handleOnContextMenu}
                uid={topic?.uid}
                currentUser={currentUser}
                comments={comments}
              />
            </div>
            <TopicInput
              isEditModalOpen={isEditModalOpen}
              isSendModalOpen={isSendModalOpen}
              setIsSendModalOpen={setIsSendModalOpen}
              setFiles={setFiles}
              text={text}
              setText={setText}
              sendComment={
                currentUser
                  ? sendComment
                  : () => {
                      navigate("/login");
                    }
              }
              editComment={editComment}
              editId={editId}
              onCancel={handleCloseModal}
              reply={reply}
              resetReply={resetReply}
            />
          </div>
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
            setFiles={setFiles}
            setIsEditModalOpen={setIsEditModalOpen}
          />
          {isEditModalOpen && (
            <FileEditModal
              files={files}
              setFiles={setFiles}
              onClose={handleCloseModal}
              text={text}
              setText={setText}
              setFilesToDelete={setFilesToDelete}
              editId={editId}
              onEdit={editComment}
            />
          )}
          {isSendModalOpen && (
            <FileSendModal
              files={files}
              setFiles={setFiles}
              onClose={handleCloseModal}
              text={text}
              setText={setText}
              onSubmit={sendComment}
            />
          )}
        </div>
      </div>
    </div>
  );
}
