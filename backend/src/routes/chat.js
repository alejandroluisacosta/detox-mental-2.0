import express from "express";
import { chatControllerExpressMiddleware } from "../controllers/chatController.js";

const router = express.Router();

router.post("/", chatControllerExpressMiddleware);

export default router;
