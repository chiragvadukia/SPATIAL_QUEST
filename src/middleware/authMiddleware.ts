import { Request, Response, NextFunction } from "express";
import { badRequestError } from "../helpers/commonFunction";
import { Schema } from "joi"; // Assuming you're using Joi for validation
import jwt from "jsonwebtoken";
import userModel from "../models/users";
import messages from "../config/messages";
import { logger, level } from "../config/logger";
import loginTokenModel from "../models/loginToken";
import adminModel from "../models/admin";

interface RequestSchema {
    headers?: Schema;
    params?: Schema;
    query?: Schema;
    body?: Schema;
}

export interface AuthenticatedRequest extends Request {
    token?: string;
    userData?: any;
    user_Ip?: string;
}

const routeMiddlewares = {
    validateRequest: (requestSchema: RequestSchema) => {
        return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
            req.user_Ip = req.socket.remoteAddress || "";
            for (const key of ["headers", "params", "query", "body"]) {
                const schema = requestSchema[key as keyof RequestSchema];
                const value = req[key as keyof AuthenticatedRequest];
                if (schema) {
                    const { error } = schema.validate(value);
                    if (error) {
                        const { details } = error;
                        const message = details.map((i) => i.message).join(",");
                        return badRequestError(res, message);
                    }
                }
            }
            next();
        };
    },

    authorize: async function (req, res: Response, next: NextFunction) {
        try {
            let token = req?.headers["authorization"];
            token = token?.split(" ")[1];
            if (!token) {
                return res.status(401).send({
                    body: null,
                    err: 1,
                    message: "Please Provide Authorization Token!",
                    statuscode: 401,
                });
            }
            const userToken = await loginTokenModel.findOne({
                token: token,
                role: 1
            });
            if (!userToken) {
                return res.status(401).send({
                    body: null,
                    err: 1,
                    message: messages['unauthorized'],
                    statuscode: 401,
                });
            }
            jwt.verify(token, process.env.JWT_TOKEN_KEY, async (err, verifyUser) => {
                if (err) {
                    if (err.name === "TokenExpiredError")
                        return res.status(401).send({
                            body: err,
                            err: 1,
                            message: "Session timeout, please login again.",
                            statuscode: 401,
                        });

                    return res.status(401).send({
                        body: err,
                        err: 1,
                        message: "Invalid Token ! ",
                        statuscode: 401,
                    });
                } else {
                    const userData = await userModel.findOne({
                        _id: verifyUser.id,
                        is_active: true,
                        is_deleted: false
                    });
                    if (!userData) {
                        return res.status(401).send({
                            body: err,
                            err: 1,
                            message: messages['user_not_found'],
                            statuscode: 401,
                        });
                    }
                    // req.userData = userData;
                    req.app.locals.userData = userData;

                    next();
                }
            });
        } catch (errorCode) {
            logger.log(level.error, `authorize failure :: ${errorCode}`);
            return badRequestError(res, errorCode.message);
        }
    },

    authorizeAdmin: async function (req, res: Response, next: NextFunction) {
        try {
            let token = req?.headers["authorization"];
            token = token?.split(" ")[1];
            if (!token) {
                return res.status(401).send({
                    body: null,
                    err: 1,
                    message: "Please Provide Authorization Token!",
                    statuscode: 401,
                });
            }
            const userToken = await loginTokenModel.findOne({
                token: token,
                role: 2,
            });
            if (!userToken) {
                return res.status(401).send({
                    body: null,
                    err: 1,
                    message: messages['unauthorized'],
                    statuscode: 401,
                });
            }
            jwt.verify(token, process.env.JWT_TOKEN_KEY, async (err, verifyUser) => {
                if (err) {
                    if (err.name === "TokenExpiredError")
                        return res.status(401).send({
                            body: err,
                            err: 1,
                            message: "Session timeout, please login again.",
                            statuscode: 401,
                        });

                    return res.status(401).send({
                        body: err,
                        err: 1,
                        message: "Invalid Token ! ",
                        statuscode: 401,
                    });
                } else {
                    const userData = await adminModel.findOne({
                        _id: verifyUser.id,
                        is_active: true,
                        is_deleted: false
                    });
                    if (!userData) {
                        return res.status(401).send({
                            body: err,
                            err: 1,
                            message: messages['user_not_found'],
                            statuscode: 401,
                        });
                    }
                    req.app.locals.userData = userData;
                    next();
                }
            });
        } catch (errorCode) {
            logger.log(level.error, `authorize failure :: ${errorCode}`);
            return badRequestError(res, errorCode.message);
        }
    },
};

export default routeMiddlewares;
