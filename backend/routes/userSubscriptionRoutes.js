import express from "express";
import {
    addSubscription,
    deleteSubscription,
} from "../controllers/userSubscriptionController.js";
const router = express.Router();

router.post("/:user2_id", addSubscription);

router.delete("/:user2_id", deleteSubscription);

export default router;