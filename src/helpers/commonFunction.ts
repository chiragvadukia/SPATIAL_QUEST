import { Response } from "express";
import HTTPStatus from "http-status";
import { logger, level } from "../config/logger";
import messages from "../config/messages";
import errlogsModel from "../models/errlogs";

interface ErrorResponseData {
    statuscode: number;
    err: number;
    body: any | null;
    message: string;
}
interface SuccessData {
    data?: any;
    message: string;
}

const sendJSONResponse = (
    res: Response,
    statusCode: number,
    data: any
): void => {
    res.status(statusCode).json(data);
};

const badRequestError = (res: Response, errors: string): void => {
    const code = HTTPStatus.BAD_REQUEST;
    const data: ErrorResponseData = {
        statuscode: code,
        err: 1,
        body: null,
        message: errors,
    };
    return sendJSONResponse(res, code, data);
};

const internalServerError = (res: Response, errors: string): void => {
    const code = HTTPStatus.INTERNAL_SERVER_ERROR;
    const payload = {
        statuscode: code,
        err: 1,
        body: null,
        message: `Error Occurred: ${errors}`,
    };
    return sendJSONResponse(res, code, payload);
};

const errorRequest = (res: Response, data: SuccessData): void => {
    const code = 200;
    const payload = {
        statuscode: code,
        err: 1,
        body: data.data ? data.data : null,
        message: data.message,
    };
    return sendJSONResponse(res, code, payload);
};
const successfulRequest = (res: Response, data: SuccessData): void => {
    const code = 200;
    const payload = {
        statuscode: code,
        err: 0,
        body: data.data ? data.data : null,
        message: data.message,
    };
    return sendJSONResponse(res, code, payload);
};

const addErrLog = async (data) => {
    try {
        await errlogsModel.create({
            user_id: data.user_id,
            payload: data.payload,
            error: data.error,
            api_name: data.api_name,
        })
        return true;
    } catch (error) {
        logger.log(level.error, messages['internal_server_err'])
        return false;
    }
};

export {
    badRequestError,
    internalServerError,
    errorRequest,
    successfulRequest,
    addErrLog
};
