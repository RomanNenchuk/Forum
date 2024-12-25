import express from "express";

import {
  getTopicsPreview,
  saveTopic,
  getTopic,
} from "../controllers/topicController.js";

import { saveImage } from "../controllers/imageController.js";

const router = express.Router();

router.get("/", getTopicsPreview);

router.post("/", saveTopic);

router.get("/:id", getTopic);

export default router;
