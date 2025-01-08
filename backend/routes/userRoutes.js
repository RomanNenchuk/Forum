import express from "express";
import middleware from "../middleware/index.js";

import {
  saveUser,
  updateUser,
  getUserInfo,
} from "../controllers/userController.js";

import { saveImage, deleteAvatar } from "../controllers/fileController.js";

const router = express.Router();

router.post("/", middleware.decodeToken, saveUser); // POST-запит для створення користувача

router.post("/:id/profile-image", middleware.decodeToken, saveImage);

router.delete("/:id/profile-image", middleware.decodeToken, deleteAvatar);

router.put("/:id", middleware.decodeToken, updateUser);

router.get("/:id", getUserInfo);

export default router;
