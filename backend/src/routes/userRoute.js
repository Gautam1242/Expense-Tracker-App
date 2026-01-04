import express from "express";
import { savePushToken } from "../controller/userController.js";

const router = express.Router();

router.post("/user/push-token", savePushToken);

export default router;
