import express from "express";
import middleware from "../middleware/index.js";

import {
  getTopicsPreview,
  saveTopic,
  getTopic,
  getTopicComments,
  PostNewComment,
  deleteComment,
  editComments,
  deleteTopic,
  getUserTopic
} from "../controllers/topicController.js";

import { setTopicReaction } from "../controllers/emojiController.js";

const router = express.Router();

router.get("/", getTopicsPreview);

router.post("/", middleware.decodeToken, saveTopic);

router.post("/comments", PostNewComment);

router.get("/mytopics", getUserTopic)

router.get("/:id/comments", getTopicComments);

router.put("/:id/reactions", middleware.decodeToken, setTopicReaction);

router.get("/:id", getTopic);

router.delete("/comments/:id", deleteComment);

router.patch("/comments/:id", editComments);

router.delete("/:id", deleteTopic);



export default router;
