import express from "express";
import {
  getChatList,
  fetchOrCreateChat,
  deleteMessage,
  editMessage,
  getMessage,
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/", getChatList);

router.get("/messages/:id", getMessage);

router.delete("/messages/:id", deleteMessage);

router.patch("/messages/:id", editMessage);

router.put("/:id", fetchOrCreateChat);

export default router;
