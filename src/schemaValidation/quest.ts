import Joi from "joi";
const stringSchema = Joi.string();
const numberSchema = Joi.number();

export const questSchema = {
    query: Joi.object().keys({
        lon: numberSchema.required(),
        lat: numberSchema.required(),
    }).unknown(),
};
export const joinQuestSchema = {
    body: Joi.object().keys({
        location: Joi.array()
            .items(Joi.number().required()) // [longitude, latitude]
            .length(2)
            .required()
    }).unknown(),
    params: Joi.object().keys({
        quest_id: stringSchema.required(),
    }).unknown(),
};
export const leaveQuestSchema = {
    params: Joi.object().keys({
        quest_id: stringSchema.required(),
    }).unknown()
};
export const showcaseSchema = {
    body: Joi.object().keys({
        location: Joi.array()
            .items(Joi.number().required())
            .length(2)
            .required(),
        quest_id: stringSchema.required(),
        is_visible: Joi.boolean().required()
    }).unknown(),
};
export const collectQuestSchema = {
    body: Joi.object().keys({
        location: Joi.array()
            .items(Joi.number().required())
            .length(2)
            .required(),
        quest_asset_id: stringSchema.required(),
    }).unknown(),
    params: Joi.object().keys({
        quest_id: stringSchema.required(),
    }).unknown()
};