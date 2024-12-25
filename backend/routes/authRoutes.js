import express from "express";
import { checkUserRegistration } from "../controllers/authController.js";

const router = express.Router();

router.get("/check-registration/:id", checkUserRegistration);

export default router;
