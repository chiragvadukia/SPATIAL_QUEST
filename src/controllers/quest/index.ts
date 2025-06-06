import catchAsync from "../../helpers/carchAsync";
import { Request, Response } from "express";
import { errorRequest, internalServerError, successfulRequest } from "../../helpers/commonFunction";
import { logger, level } from "../../config/logger";
import messages from "../../config/messages";
import questModel from "../../models/quest";
import { mongo, PipelineStage } from "mongoose";
import joinedQuestModel from "../../models/joinedQuest";
import questAssetModel from "../../models/questAsset";
import questParticipantModel from "../../models/questParticipation";
import userShowcaseModel from "../../models/userShowcase";

interface JoinLocation {
    type: 'Point';
    coordinates: [number, number];
}

interface JoinQuestPayload {
    user_id: string;
    quest_id: string;
    joined_at: Date;
    joined_location: JoinLocation;
}

interface CollectedLocation {
    type?: 'Point';
    coordinates: [number, number];
}

interface CollectAssetPayload {
    user_id: string;
    quest_id: string;
    quest_asset_id: string;
    is_collected: boolean;
    collected_at: Date;
    collected_location: CollectedLocation;
}

// * FIND QUEST
export const findQuest = catchAsync(
    async (req: Request, res: Response) => {
        const bodyData = req.query;
        const userData = req.app.locals.userData;
        try {
            const findQuest: PipelineStage[] = await questModel.aggregate([
                {
                    $match: {
                        location: {
                            $geoIntersects: {
                                $geometry: {
                                    type: "Point",
                                    coordinates: [Number(bodyData.lon), Number(bodyData.lat)], // [longitude, latitude]
                                }
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "joinedQuest",
                        let: { questId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$quest_id", "$$questId"] },
                                            { $eq: ["$user_id", userData._id] },
                                            { $eq: ["$is_joined", true] },
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "joined"
                    }
                },
                {
                    $match: {
                        joined: { $eq: [] }
                    }
                },
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
                                    "quest_asset": 1,
                                    "media_url": { $concat: [process.env.BASE_URL, "public/quest", "$media_url"] },
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
                        questAsset: 1
                    }
                }
            ]);
            const showcaseQuest = await userShowcaseModel.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [Number(bodyData.lon), Number(bodyData.lat)],
                        },
                        distanceField: "distance",
                        maxDistance: 10,
                        spherical: true,
                        key: "location",
                        query: { is_visible_for_showcase: true }
                    }
                },
                {
                    $lookup: {
                        from: "quest",
                        localField: "quest_id",
                        foreignField: "_id",
                        as: "quest"
                    }
                },
                { $unwind: "$quest" },
                {
                    $lookup: {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "users"
                    }
                },
                { $unwind: "$users" },
                {
                    $project: {
                        quest_id: 1,
                        user: "$users.email_id",
                        distance: {
                            $concat: [
                                { $toString: { $round: ["$distance", 2] } },
                                " meters away"
                            ]
                        },
                        location: 1,
                        "quest.quest_name": 1,
                        "quest.description": 1,
                        quest_media: { $concat: [process.env.BASE_URL, "public/quest", "$quest.quest_media"] },
                    }
                }
            ]);
            return successfulRequest(res, {
                data: { quest: findQuest, showcase: showcaseQuest },
                message: messages["quest_found"],
            });


        } catch (error) {
            logger.log(level.error, messages['internal_server_err']);
            return internalServerError(res, error.message);
        }
    }
);

// * JOIN QUEST
export const joinQuest = catchAsync(
    async (req: Request, res: Response) => {
        const bodyData = req.body;
        const { quest_id } = req.params;
        const userData = req.app.locals.userData;
        try {
            const findQuest = await questModel.findOne({
                _id: mongo.ObjectId.createFromHexString(quest_id.toString()),
                location: {
                    $geoIntersects: {
                        $geometry: {
                            type: "Point",
                            coordinates: bodyData.location, // [longitude, latitude]
                        }
                    }
                }
            });
            if (findQuest) {
                const findExistQuest = await joinedQuestModel.findOne({
                    user_id: userData._id,
                    quest_id: quest_id,
                })
                if (findExistQuest) {
                    if (findExistQuest.is_joined) {
                        return errorRequest(res, { data: null, message: messages['quest_already_joined'] });
                    }
                    const _joinQuest = await joinedQuestModel.updateOne({
                        user_id: userData._id,
                        quest_id: quest_id,
                        is_joined: false
                    }, {
                        is_joined: true,
                        left_at: null,
                        joined_at: new Date(),
                        joined_location: {
                            type: "Point",
                            coordinates: bodyData.location
                        }
                    });
                    return errorRequest(res, { data: null, message: messages['quest_joined'] });
                }
                const joinQuestPayload: JoinQuestPayload = {
                    user_id: userData._id.toString(),
                    quest_id: quest_id,
                    joined_at: new Date(),
                    joined_location: {
                        type: 'Point',
                        coordinates: bodyData.location as [number, number],
                    },
                };
                const _joinQuest = await joinedQuestModel.create(joinQuestPayload)
                return successfulRequest(res, {
                    data: {},
                    message: messages["quest_joined"],
                });
            } else {
                return errorRequest(res, { data: null, message: messages['quest_not_nearby'] });
            }

        } catch (error) {
            logger.log(level.error, messages['internal_server_err']);
            return internalServerError(res, error.message);
        }
    }
);

// * LEAVE QUEST
export const leaveQuest = catchAsync(
    async (req: Request, res: Response) => {
        const { quest_id } = req.params;
        const userData = req.app.locals.userData;
        try {
            const findQuest = await questModel.findOne({
                _id: quest_id,
                is_active: true,
                is_deleted: false
            })
            if (!findQuest) {
                return errorRequest(res, { data: null, message: messages['no_data_found'] });
            }
            const findExistQuest = await joinedQuestModel.findOne({
                user_id: userData._id,
                quest_id: quest_id,
                is_joined: true
            })
            if (!findExistQuest) {
                return errorRequest(res, { data: null, message: messages['quest_not_joined'] });
            }
            await userShowcaseModel.deleteOne({
                user_id: userData._id,
                quest_id: quest_id,
            })
            await questParticipantModel.deleteMany({
                user_id: userData._id,
                quest_id: quest_id,
            })
            const leftQuest = await joinedQuestModel.updateOne({
                user_id: userData._id,
                quest_id: quest_id,
            }, { is_joined: false, left_at: new Date() })

            if (!leftQuest) {
                return errorRequest(res, { data: null, message: messages['internal_server_err'] });
            }

            return successfulRequest(res, {
                data: {},
                message: messages["quest_left"],
            });
        } catch (error) {
            logger.log(level.error, messages['internal_server_err']);
            return internalServerError(res, error.message);
        }
    }
);


// * FIND QUEST ASSET
export const findQuestAsset = catchAsync(
    async (req: Request, res: Response) => {
        const bodyData = req.query;
        const userData = req.app.locals.userData;
        try {
            const [findQuestAsset] = await questAssetModel.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [Number(bodyData.lon), Number(bodyData.lat)], // [longitude, latitude]
                        },
                        distanceField: "location",
                        maxDistance: 10,
                        spherical: true
                    }
                },
                {
                    $lookup: {
                        from: "joinedQuest",
                        let: { questId: "$quest_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$quest_id", "$$questId"] },
                                            { $eq: ["$user_id", userData._id] },
                                            { $eq: ["$is_joined", true] },
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "joined"
                    }
                },
                {
                    $match: {
                        joined: { $ne: [] } // only proceed if user has joined this quest
                    }
                },
                {
                    $lookup: {
                        from: "questParticipant",
                        let: { assetId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$quest_asset_id", "$$assetId"] },
                                            { $eq: ["$user_id", userData._id] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "collected"
                    }
                },
                {
                    $match: {
                        "collected": { $eq: [] }
                    }
                },
                {
                    $project: {
                        quest_id: 1,
                        media_url: { $concat: [process.env.BASE_URL, "public/quest", "$media_url"] },
                        quest_asset: 1
                    }
                }
            ]);

            if (findQuestAsset) {
                return successfulRequest(res, {
                    data: findQuestAsset,
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

// * COLLECT QUEST ASSET
export const collectQuestAsset = catchAsync(
    async (req: Request, res: Response) => {
        const { quest_id } = req.params;
        const bodyData = req.body;
        const userData = req.app.locals.userData;
        try {
            const findJoinedQuest = await joinedQuestModel.findOne({
                user_id: userData._id,
                quest_id: mongo.ObjectId.createFromHexString(quest_id),
            })
            if (!findJoinedQuest) {
                return errorRequest(res, { data: null, message: messages['quest_not_joined'] });
            }
            const findIfCollected = await questParticipantModel.findOne({
                user_id: userData._id,
                quest_id: mongo.ObjectId.createFromHexString(quest_id),
                quest_asset_id: mongo.ObjectId.createFromHexString(bodyData.quest_asset_id.toString()),
            })
            if (findIfCollected) {
                return errorRequest(res, { data: null, message: messages['quest_asset_already_collected'] });
            }
            const [findQuestAsset] = await questAssetModel.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: bodyData.location, // [longitude, latitude]
                        },
                        distanceField: "location",
                        maxDistance: 10,
                        spherical: true,
                        query: {
                            _id: mongo.ObjectId.createFromHexString(bodyData.quest_asset_id.toString()),
                            quest_id: mongo.ObjectId.createFromHexString(quest_id),
                        }
                    }
                },
            ]);
            if (findQuestAsset) {
                const collectAssetPayload: CollectAssetPayload = {
                    user_id: userData._id.toString(),
                    quest_id: quest_id,
                    quest_asset_id: bodyData.quest_asset_id.toString(),
                    is_collected: true,
                    collected_at: new Date(),
                    collected_location: {
                        type: 'Point',
                        coordinates: bodyData.location as [number, number],
                    },
                };
                const collectAsset = await questParticipantModel.create(collectAssetPayload)
                if (!collectAsset) {
                    return errorRequest(res, { data: null, message: messages['quest_asset_not_collected'] });
                }
                const findQuestAsset = await questAssetModel.find({
                    quest_id: mongo.ObjectId.createFromHexString(quest_id),
                    is_active: true,
                    is_deleted: false
                })
                const findCompletedQuest = await questParticipantModel.find({
                    quest_id: mongo.ObjectId.createFromHexString(quest_id),
                    is_collected: true,
                    collected_at: { $ne: null }
                })

                const activeAssetIds = findQuestAsset.map(asset => asset._id.toString());
                const completedAssetIds = findCompletedQuest.map(q => q.quest_asset_id.toString());

                const allCompleted = activeAssetIds.every(id => completedAssetIds.includes(id));

                //To show the completion status to user
                if (allCompleted) {
                    await joinedQuestModel.updateOne({
                        user_id: userData._id,
                        quest_id: mongo.ObjectId.createFromHexString(quest_id)
                    }, { is_completed: true, completed_at: new Date() })
                    return successfulRequest(res, {
                        data: {
                            quest_collected: true
                        },
                        message: messages["quest_collected"],
                    });
                } else {
                    return successfulRequest(res, {
                        data: {
                            quest_collected: false
                        },
                        message: messages["quest_asset_collected"],
                    });
                }
            } else {
                return errorRequest(res, { data: null, message: messages['no_quest_asset_found'] });
            }

        } catch (error) {
            logger.log(level.error, messages['internal_server_err']);
            return internalServerError(res, error.message);
        }
    }
);