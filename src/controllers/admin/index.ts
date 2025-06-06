import catchAsync from "../../helpers/carchAsync";
import { Request, Response } from "express";
import { errorRequest, internalServerError, successfulRequest } from "../../helpers/commonFunction";
import { logger, level } from "../../config/logger";
import messages from "../../config/messages";
import questModel from "../../models/quest";
import adminModel from "../../models/admin";
import loginTokenModel from "../../models/loginToken";
import { mongo, PipelineStage } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import questAssetModel from "../../models/questAsset";


interface QuestLocation {
    type?: 'Polygon'; // Optional if default is used
    coordinates: number[][][];
}

interface AddQuestPayload {
    quest_name: string;
    description: string;
    quest_media: string | null;
    location: QuestLocation;
}
interface QuestAssetLocation {
    type?: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

interface AddQuestAssetPayload {
    quest_id: string;
    quest_asset: string;
    media_url: string | null;
    location: QuestAssetLocation;
}

//*LOGIN
export const login = catchAsync(
    async (req: Request, res: Response) => {
        const bodyData = req.body;
        try {
            let findUser = await adminModel.findOne({
                email_id: bodyData.email_id,
                is_active: true,
                is_deleted: false
            })
            if (!findUser) {
                return errorRequest(res, { data: null, message: messages['user_not_found'] })
            }
            const checkPassword = await bcrypt.compare(bodyData.password, findUser.password);
            if (!checkPassword) {
                return errorRequest(res, { data: null, message: messages['invalid_credentials'] })
            }
            const jwtTokenKey = process.env.JWT_TOKEN_KEY || "";

            const token = jwt.sign({ id: findUser._id }, jwtTokenKey, {
                expiresIn: "168h",
            });
            await loginTokenModel.deleteMany({
                role: 2,
                user_id: new mongo.ObjectId(findUser._id.toString())
            })

            await loginTokenModel.create({
                user_id: findUser._id,
                token: token,
                role: 2,
                createdAt: new Date()
            })

            return successfulRequest(res, {
                data: { name: findUser.name, email_id: findUser.email_id, _id: findUser._id, token: token },
                message: messages['login_successful'],
            });

        } catch (error) {
            logger.log(level.error, error.message + messages['internal_server_err'])
            return internalServerError(res, error.message);
        }
    }
);

// * ADD QUEST
export const addQuest = catchAsync(
    async (req: any, res: Response) => {
        const bodyData = req.body;
        try {

            const locationData: QuestLocation = {
                type: 'Polygon',
                coordinates: JSON.parse(bodyData.location),
            };

            const addQuestPayload: AddQuestPayload = {
                quest_name: bodyData.quest_name,
                description: bodyData.description,
                quest_media: req.file ? req.file.filename : null,
                location: locationData,
            };
            const addQuest = await questModel.create(addQuestPayload);
            if (addQuest) {
                return successfulRequest(res, {
                    data: addQuest,
                    message: messages["quest_added"],
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

// * ADD QUEST ASSET
export const addQuestAsset = catchAsync(
    async (req: any, res: Response) => {
        const bodyData = req.body;
        try {

            const location: QuestAssetLocation = {
                type: 'Point',
                coordinates: bodyData.location.split(',').map(Number) as [number, number],
            };

            const addQuestAssetPayload: AddQuestAssetPayload = {
                quest_id: bodyData.quest_id,
                quest_asset: bodyData.quest_asset,
                media_url: req.file ? req.file.filename : null,
                location,
            };

            const addQuestAsset = await questAssetModel.insertMany(addQuestAssetPayload);
            if (addQuestAsset) {
                return successfulRequest(res, {
                    data: addQuestAsset,
                    message: messages["quest_asset_added"],
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

// * ADD QUEST ASSET
export const lisQuest = catchAsync(
    async (req: any, res: Response) => {
        try {
            const findQuest: PipelineStage[] = await questModel.aggregate([
                {
                    $lookup: {
                        from: "questAsset",
                        let: { i_id: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$quest_id", "$$i_id"] },
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    location: 1,
                                    quest_asset: 1,
                                    media_url: { $concat: [process.env.BASE_URL, "public/quest", "$media_url"] },
                                }
                            }
                        ],
                        as: "questAsset",
                    },
                },
                {
                    $project: {
                        quest_name: 1,
                        description: 1,
                        quest_media: { $concat: [process.env.BASE_URL, "public/quest", "$quest_media"] },
                        questAsset: 1,
                        location: 1
                    }
                }
            ]);
            if (findQuest) {
                return successfulRequest(res, {
                    data: findQuest,
                    message: messages["quest_found"],
                });
            } else {
                return successfulRequest(res, { data: null, message: messages['no_data_found'] });
            }

        } catch (error) {
            logger.log(level.error, messages['internal_server_err']);
            return internalServerError(res, error.message);
        }
    }
);