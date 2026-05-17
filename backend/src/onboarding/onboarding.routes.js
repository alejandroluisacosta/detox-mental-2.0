import { Router } from "express";
import { chatControllerExpressMiddleware } from "./onboarding.controller.js";

const router = Router();
router.post("/", chatControllerExpressMiddleware);

export default router;
