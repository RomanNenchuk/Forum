import React, { useRef, useState } from "react";
import { Container, Form, Card, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login, loginWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogInWithGoogle(e) {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      const userCredential = await loginWithGoogle();
      if (!userCredential || !userCredential.user) {
        throw new Error("No user found");
      }

      navigate("/");
    } catch (error) {
      setError("Failed to create an account");
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      const userCredential = await login(
        emailRef.current.value,
        passwordRef.current.value
      );

      navigate("/");
    } catch (error) {
      console.error(error);
      setError("Failed to log in");
    }
    setLoading(false);
  }

  return (
    <Container className="d-flex align-items-center justify-content-center">
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Log In</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group id="email">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" ref={emailRef} required />
              </Form.Group>
              <Form.Group id="password">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" ref={passwordRef} required />
              </Form.Group>
              <Button disabled={loading} className="w-100 mt-2" type="submit">
                Log In
              </Button>
            </Form>
            <div className="w-100 text-center mt-3">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
          </Card.Body>
        </Card>
        <div className="w-100 text-center mt-2">
          Need an accout? <Link to="/signup">Sign Up</Link>
        </div>
        <div className="d-flex align-items-center my-4">
          <div
            style={{ flex: 1, height: "1px", backgroundColor: "#ddd" }}
          ></div>
          <span className="mx-3 text-muted">OR</span>
          <div
            style={{ flex: 1, height: "1px", backgroundColor: "#ddd" }}
          ></div>
        </div>

        <div className="d-flex justify-content-center align-items-center">
          <Button
            onClick={handleLogInWithGoogle}
            variant="light"
            className="d-flex align-items-center gap-2 px-4 py-2 rounded shadow-sm"
            style={{
              border: "1px solid #dadce0",
              fontWeight: "500",
              fontSize: "16px",
              color: "#5f6368",
              width: "fit-content",
            }}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google logo"
              style={{ width: "20px", height: "20px" }}
            />
            <span>Log in with Google</span>
          </Button>
        </div>
      </div>
    </Container>
  );
}
