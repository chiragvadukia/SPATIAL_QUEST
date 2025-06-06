import mongoose, { Schema } from "mongoose";

const questSchema = new Schema({
    quest_name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    quest_media: {
        type: String,
        require: true
    },
    location: {
        type: {
            type: String,
            enum: ['Polygon'],
            default: 'Polygon'
        },
        coordinates: {
            type: [[[Number]]], // [ [ [lng, lat], [lng, lat], ... ] ]
            required: true
        }
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true, collection: 'quest' }
);

questSchema.index({ location: '2dsphere' });

const questModel = mongoose.model("quest", questSchema);
export default questModel;
