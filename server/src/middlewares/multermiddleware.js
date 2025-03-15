import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/temp" );
        // console.log("in multer middleware", file);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
        // console.log("in multer middleware", file);
    }
})

export const upload = multer({storage})