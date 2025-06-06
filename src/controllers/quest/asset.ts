import catchAsync from "../../helpers/carchAsync";
import { Request, Response } from "express";
import { errorRequest, internalServerError, successfulRequest } from "../../helpers/commonFunction";
import { logger, level } from "../../config/logger";
import messages from "../../config/messages";
import joinedQuestModel from "../../models/joinedQuest";
import userShowcaseModel from "../../models/userShowcase";
import questModel from "../../models/quest";


// * SHOWCASE QUEST
export const showcaseQuest = catchAsync(
    async (req: Request, res: Response) => {
        const bodyData = req.body;
        const userData = req.app.locals.userData;
        try {

            const findExistQuest = await joinedQuestModel.findOne({
                user_id: userData._id,
                quest_id: bodyData.quest_id,
            })
            if (!findExistQuest) {
                return errorRequest(res, { data: null, message: messages['no_data_found'] });
            }
            if (!findExistQuest.is_completed) {
                return errorRequest(res, { data: null, message: messages['quest_incomplete'] });
            }
            if (bodyData.is_visible) {
                const isInsideQuestArea = await questModel.findOne({
                    _id: bodyData.quest_id,
                    location: {
                        $geoIntersects: {
                            $geometry: {
                                type: "Point",
                                coordinates: bodyData.location,
                            },
                        },
                    },
                });

                if (!isInsideQuestArea) {
                    return errorRequest(res, {
                        data: null,
                        message: messages['location_outside_quest'],
                    });
                }
            }
            const findExistQuestShowcase = await userShowcaseModel.findOne({
                user_id: userData._id,
                quest_id: bodyData.quest_id,
            })
            if (!findExistQuestShowcase) {
                const _addToShowcase = await userShowcaseModel.create({
                    user_id: userData._id,
                    quest_id: bodyData.quest_id,
                    is_visible_for_showcase: bodyData.is_visible,
                    location: {
                        type: "Point",
                        coordinates: bodyData.location
                    }
                })
            } else {
                const _updateShowcase = await userShowcaseModel.updateOne({
                    user_id: userData._id,
                    quest_id: bodyData.quest_id,
                }, {
                    is_visible_for_showcase: bodyData.is_visible,
                })
            }
            return successfulRequest(res, {
                data: {},
                message: messages[bodyData.is_visible ? "added_to_showcase" : 'removed_to_showcase'],
            });


        } catch (error) {
            logger.log(level.error, messages['internal_server_err']);
            return internalServerError(res, error.message);
        }
    }
);