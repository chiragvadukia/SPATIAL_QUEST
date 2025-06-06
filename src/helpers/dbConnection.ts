import mongoose from "mongoose";
import { logger ,level} from "../config/logger";

const connectDB = async () => {
  mongoose
    .connect(process.env.MONGODB_URL || "")
    .then(() => {
      console.log("DB connection established..");
    })
    .catch((err: Error) => logger.log(level.error,`DB connection error : ${err}`));
};

export default connectDB;
