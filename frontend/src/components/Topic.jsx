import React, { useState, useEffect } from "react";
import { Container, Card } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import LoadingSpinner from "./Spinner";

import axios from "axios";

export default function Topic() {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchTopic() {
    try {
      const result = await axios.get(`http://localhost:5000/topics/${id}`);
      setTopic(result.data);
    } finally {
      setLoading(false);
    }
  }

  // вантажу інформацію з БД при монтуванні компонента
  useEffect(() => {
    setLoading(true);
    fetchTopic();
  }, [id]);

  if (loading) return <LoadingSpinner />;

  return (
    <Container className="d-flex align-items-center justify-content-center">
      <div className="w-100" style={{ maxWidth: "800px" }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">{topic?.title}</h2>
            <Link to={`/profiles/${topic?.author}`}>
              <div className="text-center mb-4 profile-image-container">
                <img
                  src={topic?.avatar || "/default-avatar.png"}
                  alt="User Avatar"
                  className="profile-image"
                />
              </div>
            </Link>
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

            <ul className="responseList"></ul>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}
