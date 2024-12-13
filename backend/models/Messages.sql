-- Створення таблиці повідомлень
CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    sender_id VARCHAR(255) NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    receiver_id VARCHAR(255) NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachment_url TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);