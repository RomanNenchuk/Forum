import express from "express";
import {
  getChatList,
  fetchOrCreateChat,
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/", getChatList);

router.put("/:id", fetchOrCreateChat);

export default router;
