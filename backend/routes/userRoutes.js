import express from "express";

import {
  saveUser,
  updateUser,
  getUserInfo,
} from "../controllers/userController.js";

import { saveImage } from "../controllers/imageController.js";

const router = express.Router();

router.post("/", saveUser); // POST-запит для створення користувача

router.post("/:id/profile-image", saveImage);

router.put("/:id", updateUser);

router.get("/:id", getUserInfo);

export default router;
