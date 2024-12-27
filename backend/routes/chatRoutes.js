import express from "express";
import {
  getChatList,
  fetchOrCreateChat,
  deleteMessage,
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/", getChatList);

router.delete("/messages/:id", deleteMessage);

router.put("/:id", fetchOrCreateChat);

export default router;
