import express from "express";
import {SendEmailRestController} from "./email/sendEmailRestController";

const router = express.Router();

router.post("/send-email",
    (req: express.Request, res: express.Response, next: express.NextFunction) =>
        new SendEmailRestController().handle(req, res, next)
);

export default router;