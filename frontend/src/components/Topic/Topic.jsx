import React, { useState, useEffect, useRef } from "react";
import { Container, Card } from "react-bootstrap";
import { Link, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useUserInfo } from "../../contexts/UserInfoContext";
// import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.jsx";
import ProfileHeader from "../ProfileHeader";
import LoadingSpinner from "../Spinner";
import TopicInput from "./TopicInput";
import TopicComments from "./TopicComments";
import TopicContextMenu from "./TopicContextMenu";
import ContextMenu from "../ContextMenu/ContextMenu";
import axios from "axios";

export default function Topic() {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const [text, setText] = useState("");
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  
  // useBodyScrollLock(isContextMenuOpen);
  const [files, setFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]); // Список файлів на видалення
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [editId, setEditId] = useState(-1);
  const [replyId, setReply] = useState(-1);
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
      const result = await axios.get(`http://localhost:5000/topics/${id}`);
      setTopic(result.data);
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
      const result = await axios.get(`http://localhost:5000/topics/${id}/comments`);
      setComments(result.data);
      console.log(result.data);
    } catch(error) {
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
      const comm = { // має бути таким же, як і result.data з fetchTopicComents
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
      const result = await axios.post(`http://localhost:5000/topics/comments`, comm);
      comm.id = result.data.id;
      comm.reply_text = result.data.reply_text;
      console.log(comm);
      setComments(prev => [comm, ...prev]);
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
    //     reply: replyId,
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
    alert("edit");
  }

  async function deleteComment(commId) {
    try {
      const attach = await axios.delete(`http://localhost:5000/topics/comments/${commId}`);
      // for()
    } catch {
      
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
    <Container className="d-flex align-items-center justify-content-center">
      <div className="w-100" style={{ maxWidth: "800px" }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">{topic?.title}</h2>
            <ProfileHeader
              id={topic?.author}
              avatar={topic?.avatar}
              profileName={topic?.username}
              size={70}
              gap="10px"
              textStyle={{ color: "#000" }}
            />
            <p>
              Created by {topic?.username} on {topic?.formatted_date}
            </p>
            <p>{topic?.description}</p>
            <ul>
              {topic?.attachments.map((attachment, index) => (
                <li key={index}>
                  <img src={attachment} />
                </li>
              ))}
            </ul>
          </Card.Body>
        </Card>
        <TopicInput
            isEditModalOpen={isEditModalOpen}
            isSendModalOpen={isSendModalOpen}
            setIsEditModalOpen={setIsEditModalOpen}
            setIsSendModalOpen={setIsSendModalOpen}
            setFiles={setFiles}
            text={text}
            setText={setText}
            sendComment={sendComment}
            editComment={editComment}
            editId={editId}
            onCancel={handleCloseModal}
            replyId={replyId}
            resetReply={resetReply}
            getComment={() => "*Unknown comment*"}
            getUseruserName={() => "*Unknown user*"}
        />
        <TopicContextMenu
            positionX={contextMenu.position.x}
            positionY={contextMenu.position.y}
            isToggled={contextMenu.toggled}
            contextMenuRef={contextMenuRef}
            resetContextMenu={resetContextMenu}
            currentUser={currentUser}
            contextMenu={contextMenu}
            deleteComment={deleteComment} // <- дописати
            editComment={null}
            setEdit={null}
            replyComment={null}
            setReply={null}
        />
        <TopicComments
          handleOnContextMenu={handleOnContextMenu}
          comments={comments}
          getComment={() => "*Unknown comment*"}
          getUseruserName={() => "*Unknown user*"}
        />
      </div>
    </Container>
  );
}
