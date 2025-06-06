import mongoose, { Schema } from "mongoose";

const errlogsSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    api_name: {
        type: String,
        required: true
    },
    payload: {
        type: String,
        required: true
    },
    error: {
        type: String,
        required: true
    },
}, { timestamps: true, collection: 'err_logs' }
);

const errlogsModel = mongoose.model("err_logs", errlogsSchema);
export default errlogsModel;
