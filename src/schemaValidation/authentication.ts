import Joi from "joi";
const stringSchema = Joi.string();

export const userSignupSchema = {
    body: Joi.object({
        email_id: stringSchema.required(),
        password: stringSchema.required(),
        device_type: stringSchema.required(),
        fcm_token: stringSchema.allow("", null),
        device_id: stringSchema.required()
    }).unknown(),
};
