import express from "express";
import ResumeController from "../controllers/ResumeController";
import authMiddleware from "../middlewares/auth";

const resumeRouter = express.Router();

resumeRouter.use(authMiddleware);
resumeRouter.get("/", ResumeController.get);

export default resumeRouter;
