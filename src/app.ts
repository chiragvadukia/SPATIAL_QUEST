import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";
import { logger, level } from "./config/logger";
import connectDB from "./helpers/dbConnection";
import routes from "./routes/routes";

// * INIT
const app = express();
const port = process.env.PORT || 8000;
const isProd = process.env.NODE_ENV === "production";
const corsOptions = isProd ? process.env.BASE_URL || "*" : "*";
const loggerMode = isProd ? "common" : "dev";

// * MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(loggerMode));
app.use(
    cors({
        origin: corsOptions,
    })
);

//Database Connection
connectDB();
app.use("/public", express.static("public"));

// * ROUTES
app.use("/api", routes);

// * 404 - NOT FOUND
app.use("*", (req: Request, res: Response) => {
    return res.status(404).json({ msg: "NOT FOUND!" });
});

// * GLOBAL ERROR HANDLER
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    const response: { msg: string; error?: string } = {
        msg: "INTERNAL_SERVER_ERROR",
    };
    if (!isProd) response["error"] = err.stack || "";
    logger.log(level.info, `GLOBAL ERROR :: ${err}`);
    logger.log(level.info, `GLOBAL ERROR STACK :: ${err?.stack}`);
    return res.status(500).json(response);
});

app.listen(port, () => {
    return console.log(`Server started on port: ${port} \nCheckout: ${process.env.BASE_URL}`);
});
