import Joi from "joi";
const stringSchema = Joi.string();

export const loginSchema = {
    body: Joi.object().keys({
        email_id: stringSchema.required(),
        password: stringSchema.required(),
    }).unknown(),
};
export const questSchema = {
    body: Joi.object().keys({
        quest_name: stringSchema.required(),
        description: stringSchema.required(),
        // location: Joi.array()
        //     .items(
        //         Joi.array()
        //             .items(Joi.array().items(Joi.number().required(), // [lng, lat]
        //             ).length(2).required()
        //             ).min(4).required()
        //     ).min(1).required()
    }).unknown(),
};
export const questAssetSchema = {
    body: Joi.object().keys({
        quest_asset: stringSchema.required(),
        quest_id: stringSchema.required(),
        // location: Joi.array()
        //     .items(Joi.number().required()) // [longitude, latitude]
        //     .length(2)
        //     .required()
    }).unknown(),
};