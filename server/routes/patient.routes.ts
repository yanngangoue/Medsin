import { Router } from "express";
import { requireJwt } from "../middleware/requireJwt";
import * as patientController from "../controllers/patient.controller";

export const patientRouter = Router();

patientRouter.get("/me", requireJwt, patientController.getMe);
patientRouter.post("/onboarding", requireJwt, patientController.saveOnboarding);
