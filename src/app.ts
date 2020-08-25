import express from "express";
import bodyParser from "body-parser";
import router from "./router";
import dotenv from 'dotenv';
import {InputValidationError} from "./email/sendEmailRestController";
import {EmailServiceFailure} from "./email/emailService";

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use('/api', router)

app.use(function (err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
    switch (true) {
        case  err instanceof InputValidationError:
            return res.status(400).json({ errorDetails: { description: err.message}});
        case  err instanceof EmailServiceFailure:
            return res.status(500).json({ errorDetails: { description: "An error occurred", apiErrors: err.apiResponse}});
        default:
            return res.status(500).json({ message: "An error occurred"});
    }
});


app.listen(3000, () => console.log("server starting on port 3000!"));

export default app;