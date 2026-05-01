import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.routes";
import { patientRouter } from "./routes/patient.routes";
import { appointmentRouter } from "./routes/appointment.routes";
import { eligibilityRouter } from "./routes/eligibility.routes";

export function createExpressApp() {
  const app = express();

  const origin = process.env.NEXT_PUBLIC_APP_URL;
  app.use(
    cors({
      origin: origin || true,
      credentials: false,
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "medsim-express" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api", patientRouter);
  app.use("/api/appointments", appointmentRouter);
  app.use("/api/eligibility", eligibilityRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    },
  );

  return app;
}
