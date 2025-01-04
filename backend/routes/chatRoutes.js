import express from "express";
import {
  getChatList,
  fetchOrCreateChat,
  getMessage,
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/", getChatList);

router.get("/messages/:id", getMessage);

router.put("/:id", fetchOrCreateChat);

export default router;
