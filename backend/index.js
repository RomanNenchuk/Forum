import express from "express";
import cors from "cors";
import middleware from "./middleware/index.js";
import { connectDB } from "./db.js";
import userRoutes from "./routes/userRoutes.js";
import topicRoutes from "./routes/topicRoutes.js";
import chatsRoutes from "./routes/chatRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import fileUploadRoutes from "./routes/fileUploadRoutes.js";
import subscriptionRoutes from "./routes/userSubscriptionRoutes.js"
import tagRoutes from "./routes/tagRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import { Server } from "socket.io";
import { chatSocket } from "./sockets/chatSocket.js";
import dotenv from "dotenv";
dotenv.config({ path: "./config/.env" });

const app = express();

const PROTOCOL = process.env.PROTOCOL;
const HOST = process.env.HOST;
const BACKEND_PORT = process.env.BACKEND_PORT;
const FRONTEND_PORT = process.env.FRONTEND_PORT;

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

app.use("/comments", commentRoutes);

app.use("/chats", middleware.decodeToken, chatsRoutes);

app.use("/attachments", fileUploadRoutes);

app.use("/tags", tagRoutes);

app.use("/subscriptions", subscriptionRoutes);

const expressServer = app.listen(BACKEND_PORT, () => {
  console.log(`Server is running on ${PROTOCOL}://${HOST}:${BACKEND_PORT}`);
});

const io = new Server(expressServer, {
  cors: {
    origin: `${PROTOCOL}://${HOST}:${FRONTEND_PORT}`,
    methods: ["GET", "POST"],
  },
});

chatSocket(io);
