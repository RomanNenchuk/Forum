import express from "express";
import {
  getChatList,
  fetchOrCreateChat,
  getMessage,
  deleteChat,
  clearChat,
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/", getChatList);

router.get("/messages/:id", getMessage);

router.delete("/messages/:id", clearChat);

router.put("/:id", fetchOrCreateChat);

router.delete("/:id", deleteChat);

export default router;
