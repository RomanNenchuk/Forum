import express from "express";

import {
  saveUser,
  updateUser,
  getUserInfo,
} from "../controllers/userController.js";

import { saveImage } from "../controllers/imageController.js";

const router = express.Router();

router.post("/signup", saveUser); // POST-запит для створення користувача

router.post("/profile-image", saveImage);

router.put("/update", updateUser);

router.get("/info", getUserInfo);

export default router;
