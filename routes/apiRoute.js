const express = require("express");
const apiControllers = require("./../controllers/apiControllers");
const apiMiddlewares = require("./../middlewares/apiMiddlewares");

const router = express.Router();

router.route("/create_new_storage").post(apiControllers.createNewStorage);

router
  .route("/upload_file")
  .post(
    apiMiddlewares.uploader.single("file"),
    apiControllers.uploadSingleFile
  );

router
  .route("/text_file_to_audio")
  .post(
    apiMiddlewares.textUploader.single("file"),
    apiControllers.textFileToAudio
  );

router
  .route("/merge_image_and_audio")
  .post(
    apiMiddlewares.audioAndImageUploader.array("files", 2),
    apiControllers.mergeImageAndAudio
  );

router
  .route("/merge_video_and_audio")
  .post(
    apiMiddlewares.audioAndVideoUploader.array("files", 2),
    apiControllers.mergeVedioAndAudio
  );

router
  .route("/merge_all_videos")
  .post(
    apiMiddlewares.videosUploader.array("files"),
    apiControllers.mergeAllVideos
  );

router.route("/download_file").get(apiControllers.downloadFile);

router.route("/my_uploaded_files").get(apiControllers.myFileUploadedData);

module.exports = router;
