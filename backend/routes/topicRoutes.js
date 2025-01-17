import express from "express";
import middleware from "../middleware/index.js";

import {
  getTopicsPreview,
  saveTopic,
  getTopic,
  getTopicComments,
  PostNewComment,
} from "../controllers/topicController.js";

import { setTopicReaction } from "../controllers/emojiController.js";

const router = express.Router();

router.get("/", getTopicsPreview);

router.post("/", middleware.decodeToken, saveTopic);

router.post("/comments", PostNewComment);

router.get("/:id/comments", getTopicComments);

router.put("/:id/reactions", middleware.decodeToken, setTopicReaction);

router.get("/:id", getTopic);

export default router;
