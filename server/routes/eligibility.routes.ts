import { Router } from "express";
import { requireJwt } from "../middleware/requireJwt";
import * as eligibilityController from "../controllers/eligibility.controller";

export const eligibilityRouter = Router();

eligibilityRouter.post("/simulate", requireJwt, eligibilityController.simulate);
