import express from "express";
import {
  checkUserRegistration,
  checkUsername,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/check-registration/:id", checkUserRegistration);

router.get("/check-username/:username", checkUsername);

export default router;
