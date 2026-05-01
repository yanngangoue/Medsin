import { Router } from "express";
import { requireJwt } from "../middleware/requireJwt";
import * as appointmentController from "../controllers/appointment.controller";

export const appointmentRouter = Router();

appointmentRouter.get("/", requireJwt, appointmentController.listAppointments);
appointmentRouter.post("/", requireJwt, appointmentController.createAppointment);
