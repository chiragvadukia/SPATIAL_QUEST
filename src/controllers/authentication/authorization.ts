import catchAsync from "../../helpers/carchAsync";
import { Request, Response } from "express";
import { addErrLog, errorRequest, internalServerError, successfulRequest } from "../../helpers/commonFunction";
import { logger, level } from "../../config/logger";
import userModel from "../../models/users";
import messages from "../../config/messages";
import jwt from "jsonwebtoken";
import loginTokenModel from "../../models/loginToken";
import bcrypt from "bcryptjs";

interface user {
    email_id?: string,
    social_id?: string,
    source?: string,
    app_version?: string,
    createdAt?: Date,
    device_type?: string,
    device_id?: string,
    fcm_token?: string,
    password?: string,
    updatedAt?: Date
}

// * REGISTER USER
export const signupUser = catchAsync(async (req: Request, res: Response) => {
    const bodyData = req.body;

    try {
        const existingUser = await userModel.findOne({
            is_deleted: false,
            is_active: true,
            email_id: bodyData.email_id,
        });

        await userModel.updateMany({ fcm_token: bodyData.fcm_token }, { fcm_token: null });

        if (existingUser) {
            const isValidPassword = await bcrypt.compare(String(bodyData.password), existingUser.password);
            if (!isValidPassword) {
                return errorRequest(res, { data: null, message: messages['invalid_credentials'] });
            }
            const updatePayload: user = {
                app_version: bodyData.app_version,
                createdAt: new Date(),
                device_type: bodyData.device_type,
                device_id: bodyData.device_id,
                fcm_token: bodyData.fcm_token,
            };

            const updatedUser = await userModel.findByIdAndUpdate(existingUser._id, updatePayload, { new: true }).lean();
            if (!updatedUser) throw new Error(messages['internal_server_err']);

            const token = jwt.sign({ id: existingUser._id }, process.env.JWT_TOKEN_KEY || "", { expiresIn: "366d" });

            // Prevent multiple login
            await loginTokenModel.deleteMany({ user_id: existingUser._id, role: 1 });
            await loginTokenModel.create({ user_id: existingUser._id, token, role: 1, createdAt: new Date() });

            return successfulRequest(res, {
                data: { user: { _id: updatedUser._id, email_id: updatedUser.email_id }, token },
                message: messages['login_successful'],
            });
        } else {
            // Hash the password
            const hashedPassword = await bcrypt.hash(String(bodyData.password), await bcrypt.genSalt(10));

            const newUser: user = {
                email_id: bodyData.email_id,
                app_version: bodyData.app_version,
                createdAt: new Date(),
                device_type: bodyData.device_type,
                device_id: bodyData.device_id,
                fcm_token: bodyData.fcm_token,
                password: hashedPassword,
            };

            const createdUser = await userModel.create(newUser);
            if (!createdUser) throw new Error(messages['internal_server_err']);

            const user = await userModel.findById(createdUser._id, {
                email_id: 1,
            }).lean();

            // Generate JWT token for new user
            const token = jwt.sign({ id: user._id }, process.env.JWT_TOKEN_KEY || "", { expiresIn: "366d" });

            // Prevent multiple login
            await loginTokenModel.deleteMany({ user_id: user._id, role: 1, });
            await loginTokenModel.create({ user_id: user._id, token, role: 1, createdAt: new Date() });

            return successfulRequest(res, {
                data: { user, token },
                message: messages['registration_successful'],
            });
        }
    } catch (error) {
        logger.log(level.error, error.message + messages['internal_server_err']);
        await addErrLog({
            user_id: null,
            api_name: 'signupUser',
            payload: JSON.stringify(bodyData),
            error: JSON.stringify(error),
        });
        return internalServerError(res, error.message);
    }
});

// * SIGN OUT
export const signOut = catchAsync(
    async (req: any, res: Response) => {
        const userData = req.app.locals.userData;

        try {
            if (!userData._id) {
                return errorRequest(res, { data: null, message: messages['invalid_id'] });
            }
            const findExistingUser = await userModel.findOne({ _id: userData._id });

            if (findExistingUser) {
                // Clear FCM token to disable push notifications
                await userModel.updateMany(
                    { _id: userData._id },
                    { fcm_token: null }
                );
                await loginTokenModel.deleteMany({ user_id: userData._id, role: 1 });

                return successfulRequest(res, {
                    data: {},
                    message: messages["logout_successful"],
                });
            } else {
                return errorRequest(res, { data: null, message: messages['internal_server_err'] });
            }
        } catch (error) {
            logger.log(level.error, messages['internal_server_err']);
            return internalServerError(res, error.message);
        }
    }
);
