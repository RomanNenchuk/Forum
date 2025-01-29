import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ModalLoading from "./ModalLoading";
import ModalHeader from "./ModalHeader/ModalHeader.jsx";
import { Card } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext.jsx";
import axios from "axios";

export default function Share({onCloseModal}) {
  const [loading, setLoading] = useState(null);
  const { currentUser, token } = useAuth();
  const [userList, setUserList] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
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


  return(
    <ModalLoading modalLoading={loading}>
      <ModalHeader title={'Оберіть користувача'} onClose={onCloseModal} />
      <Card>
        {userList.map((user, index) => {
            return(
              <Card.Body
                key={index}
                onClick={() => {
                  navigate(`/chats/${user.other_user_id}`, {
                    state: {
                      otherUserName: user.other_user_name,
                      text: `${location.state?.topic_url}`,
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
              </Card.Body>
            );
          }
        )}
      </Card>
    </ModalLoading>
  );
}