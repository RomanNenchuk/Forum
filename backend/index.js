import express from "express";
import cors from "cors";
import middleware from "./middleware/index.js";
import { connectDB } from "./db.js";
import userRoutes from "./routes/userRoutes.js";
import topicRoutes from "./routes/topicRoutes.js";
const app = express();
const PORT = 5000;

// Підключення до бази даних
connectDB().catch((err) => {
  console.error("Failed to connect to database, exiting...");
  process.exit(1); // Завершення процесу в разі невдачі
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(middleware.decodeToken);

// Маршрут для API
app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.use("/user", userRoutes);

app.use("/topic", topicRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
