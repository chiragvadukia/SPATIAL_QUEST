import path from "path";
import multer from "multer";
import { logger, level } from "../config/logger";
import { badRequestError } from "./commonFunction";
import messages from "../config/messages";

const uploadImgDirectory = "public/quest/";

// Multer file filter for image files
const fileFilter = (req: any, file: any, cb: any) => {
  if (['.blend', '.usdz', '.gltf', '.glb'].includes(path.extname(file.originalname).toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only blend, USDZ, GlTF and GLB files are allowed.")
    );
  }
};


// Configure Multer storage
const imgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadImgDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname).toLowerCase());
  },
});

// Configure Multer upload
const imgUpload = multer({
  storage: imgStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});


const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    logger.log(level.info, `err--handleMulterErrors--11-->> ${err}`);
    if (err.code === "LIMIT_FILE_SIZE") {
      return badRequestError(res, messages["file_size"]);
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return badRequestError(res, messages["file_limit"]);
    } else {
      return badRequestError(res, `${err}`);
    }
  } else if (err) {
    logger.log(level.info, `err--handleMulterErrors--22-->> ${err}`);
    return badRequestError(res, `${err}`);
  }
  next();
};


export { imgUpload, uploadImgDirectory, handleMulterErrors };
