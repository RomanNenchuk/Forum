import express from "express";

import { saveAttachments } from "../controllers/fileController.js";

const router = express.Router();

router.post("/:id", saveAttachments);

export default router;
