import express from "express";

import { getTopics } from "../controllers/topicController.js";

import { saveImage } from "../controllers/imageController.js";

const router = express.Router();

router.get("/", getTopics);

export default router;
