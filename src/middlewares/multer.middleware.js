/// saving file locally at server system

import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
});

// const randomString = (ranNum) => {
//   let final = "";
//   let randomNumber =
//     ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890;
//   let randomLength = randomNumber.length;
//   for (let i = 0; i < ranNum; i++) {
//     let randommultiply = Math.floor(Math.random() * randomLength);
//     final += randomNumber.charAt(randommultiply);
//   }
//   return final;
// };
