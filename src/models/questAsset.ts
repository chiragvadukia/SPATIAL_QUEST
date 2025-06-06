import mongoose, { Schema } from "mongoose";

const questAssetSchema = new Schema({
    quest_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    quest_asset: {
        type: String,
        require: true
    },
    media_url: {
        type: String,
        require: true
    },
    location: {
        type: { type: String, default: "Point" },
        coordinates: { type: [Number], default: [0, 0] },
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true, collection: 'questAsset' }
);

questAssetSchema.index({ location: "2dsphere" });
const questAssetModel = mongoose.model("questAsset", questAssetSchema);
export default questAssetModel;
