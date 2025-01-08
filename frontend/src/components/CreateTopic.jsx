import React, { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";

export default function CreateTopic() {
  const titleRef = useRef();
  const tagsRef = useRef();
  const navigate = useNavigate();

  const { currentUser, token } = useAuth();

  const descriptionRef = useRef();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const topicData = {
      title: titleRef.current.value,
      author: currentUser.uid,
      tags: tagsRef.current.value.split(",").map(tag => tag.trim()), // Розділяємо теги через кому
      description: descriptionRef.current.value,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/topics",
        topicData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Передаємо токен
          },
        }
      );

      if (response.status !== 201) {
        throw new Error("Failed to create topic");
      }
      setSuccess("Topic created successfully!");

      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="d-flex align-items-center justify-content-center">
      <div className="w-90">
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Create Topic</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group id="title" className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control type="text" ref={titleRef} required />
              </Form.Group>
              <Form.Group id="tags" className="mb-3">
                <Form.Label>Tags (comma-separated)</Form.Label>
                <Form.Control type="text" ref={tagsRef} />
              </Form.Group>
              <Form.Group id="description" className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" ref={descriptionRef} rows={3} />
              </Form.Group>
              <Button disabled={loading} className="w-100 mt-3" type="submit">
                {loading ? "Creating..." : "Create Topic"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}
