import express from "express";
import cors from "cors";
import middleware from "./middleware/index.js";
import { connectDB } from "./db.js";
import userRoutes from "./routes/userRoutes.js";
import topicRoutes from "./routes/topicRoutes.js";
import chatsRoutes from "./routes/chatRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import fileUploadRoutes from "./routes/fileUploadRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import { Server } from "socket.io";
import { chatSocket } from "./sockets/chatSocket.js";
const app = express();
const PORT = 5000;

// Підключення до бази даних
connectDB().catch(err => {
  console.error("Failed to connect to database, exiting...");
  process.exit(1); // Завершення процесу в разі невдачі
});

// Middleware
app.use(cors());
app.use(express.json());
// app.use(middleware.decodeToken);

// Маршрут для API
app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.use("/auth", authRoutes);

app.use("/users", userRoutes);

app.use("/topics", topicRoutes);

app.use("/chats", middleware.decodeToken, chatsRoutes);

app.use("/attachments", fileUploadRoutes);

app.use("/tags", tagRoutes);

const expressServer = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const io = new Server(expressServer, {
  cors: {
    origin: "http://localhost:5173", // порт, на якому запущений фронтенд
    methods: ["GET", "POST"],
  },
});

chatSocket(io);
