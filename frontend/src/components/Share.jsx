import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "./Modal.jsx";
import ModalHeader from "./ModalHeader/ModalHeader.jsx";
import { Card } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useSocket } from "../contexts/SocketProviderContext.jsx";
import { useUserInfo } from "../contexts/UserInfoContext.jsx";
import axios from "axios";
import ModalLoading from "./ModalLoading.jsx";

export default function Share({ onCloseModal, url }) {
  const [loading, setLoading] = useState(null);
  const { currentUser, token } = useAuth();
  const { fullName } = useUserInfo();
  const [userList, setUserList] = useState([]);
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    (async () => {
      try {
          setLoading(true);
          const result = await axios.get("http://localhost:5000/chats", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log(result.data);
          setUserList(result.data);
      } finally {
          setLoading(false);
      }
      })();
  }, []);

  if(loading) return <Modal><ModalLoading modalLoading={true}/></Modal>

  return(
      <Modal onCloseModal={onCloseModal}>
        <Card>
          <ModalHeader title={'Оберіть користувача'} onClose={onCloseModal} />
          <Card.Body>
            {userList.map((user, index) => {
                return(
                  <Card
                    key={index}
                    onClick={() => {
                      navigate(`/chats/${user.other_user_id}`, {
                        state: {
                          otherUserName: user.other_user_name,
                          text: url,
                        }
                      })
                    }}
                    style={{ display: "flex", cursor: "pointer",}}
                  >
                    <img 
                      src={user.other_user_avatar} 
                      style={{ width: "40px", height: "40px"}} 
                    />
                    <div>{user.other_user_name}</div>
                  </Card>
                );
              }
            )}
          </Card.Body>
        </Card>
      </Modal>
  );
}