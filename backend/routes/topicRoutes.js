import express from "express";

import {
  getTopicsPreview,
  saveTopic,
  getTopic,
  getTopicComments,
  PostNewComment,
} from "../controllers/topicController.js";

import { saveImage } from "../controllers/fileController.js";

const router = express.Router();

router.get("/", getTopicsPreview);

router.post("/", saveTopic);

router.get("/:id", getTopic);

router.get("/:id/comments", getTopicComments);

router.post("/comments", PostNewComment);

export default router;
