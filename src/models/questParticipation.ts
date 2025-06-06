import mongoose, { Schema } from "mongoose";

const questParticipantSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    quest_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    quest_asset_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    is_collected: {
        type: Boolean,
        default: false,
    },
    collected_at: {
        type: Date,
        default: new Date(),
    },
    collected_location: {
        type: { type: String, default: "Point" },
        coordinates: { type: [Number], default: [0, 0] },
    }
}, { timestamps: true, collection: 'questParticipant' }
);

questParticipantSchema.index({ collected_location: "2dsphere" });
const questParticipantModel = mongoose.model("questParticipant", questParticipantSchema);
export default questParticipantModel;
