const jwt = require("jsonwebtoken");
const textToSpeech = require("@google-cloud/text-to-speech");
const ffmpeg = require("fluent-ffmpeg");
const fsExtra = require("fs-extra");
const fs = require("fs");

const client = new textToSpeech.TextToSpeechClient({
  keyFilename: "",
});

// Set the voice and audio format parameters
const voice = {
  languageCode: "en-US",
  ssmlGender: "MALE",
};

const audioConfig = {
  audioEncoding: "MP3",
};

exports.createNewStorage = async (req, res) => {
  try {
    if (req.cookies.token) {
      const token = jwt.sign(
        { token: Math.random().toString(36).substring(2) },
        "secretkey"
      );

      res.cookie("token", token, { httpOnly: true });
    } else {
      // Set a new token as a cookie
      const token = jwt.sign(
        { token: Math.random().toString(36).substring(2) },
        "secretkey"
      );

      res.cookie("token", token, { httpOnly: true });
    }

    res.status(201).json({
      status: "ok",
      message: "Storage Created Successfully",
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.uploadSingleFile = async (req, res) => {
  try {
    if (req.file) {
      res.status(200).json({
        status: "ok",
        file_path: `public/upload/${req.file.filename}`,
      });
    } else {
      throw new Error("Error uploading file");
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.textFileToAudio = async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("No file uploaded");
    }

    // Read the text file
    const text = req.file.buffer.toString("utf8");

    // Convert the text to audio
    const request = {
      input: { text: text },
      voice: voice,
      audioConfig: audioConfig,
    };
    const [response] = await client.synthesizeSpeech(request);

    // Generate a unique file name for the audio file
    let fileName = `${req.cookies.token}.mp3`;
    let fileNumber = 0;

    // Check if a file with the same name already exists
    while (fs.existsSync(`public/upload/${fileName}`)) {
      fileNumber++;
      fileName = `${req.cookies.token}(${fileNumber}).mp3`;
    }

    // Save the audio file in the public/upload directory
    fs.writeFile(
      `public/upload/${fileName}`,
      response.audioContent,
      "binary",
      (err) => {
        if (err) {
          throw err;
        }
        res.send({ path: `public/upload/${fileName}` });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

exports.mergeImageAndAudio = async (req, res) => {
  try {
    if (!req.files || req.files.length !== 2) {
      throw new Error("Two files must be uploaded");
    }

    // Create an array of the uploaded files
    const files = req.files;

    await files.forEach((file) => {
      fs.writeFileSync(
        `temp/${req.cookies.token}_${file.originalname}`,
        file.buffer
      );
    });

    // Find the image file and the audio file
    const imageFile = files.find(
      (file) => file.mimetype === "image/jpeg" || file.mimetype === "image/png"
    );
    const audioFile = files.find(
      (file) => file.mimetype === "audio/mp3" || file.mimetype === "audio/mpeg"
    );

    console.log(imageFile);

    // Generate a unique file name for the video file
    let fileName = `${req.cookies.token}.mp4`;
    let fileNumber = 0;

    // Check if a file with the same name already exists
    while (fs.existsSync(`public/upload/${fileName}`)) {
      fileNumber++;
      fileName = `${req.cookies.token}(${fileNumber}).mp4`;
    }

    // Use ffmpeg to combine the image and audio files into a video
    ffmpeg(`temp/${req.cookies.token}_${imageFile.originalname}`)
      .input(`temp/${req.cookies.token}_${audioFile.originalname}`)
      .audioCodec("aac")
      .save(`public/upload/${fileName}`)
      .on("error", (err) => {
        throw err;
      })
      .on("end", () => {
        // Delete the original video and audio files in the temp folder
        files.forEach((file) => {
          fs.unlink(`temp/${req.cookies.token}_${file.originalname}`, (err) => {
            if (err) {
              console.error(err);
            }
          });
        });

        res.status(201).json({ path: `public/upload/${fileName}` });
      });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

exports.mergeVedioAndAudio = async (req, res) => {
  try {
    if (!req.files || req.files.length !== 2) {
      throw new Error("Two files must be uploaded");
    }

    // Create an array of the uploaded files
    const files = req.files;

    await files.forEach((file) => {
      fs.writeFileSync(
        `temp/${req.cookies.token}_${file.originalname}`,
        file.buffer
      );
    });

    // Find the video file and the audio file
    const videoFile = files.find((file) => file.mimetype === "video/mp4");
    const audioFile = files.find(
      (file) => file.mimetype === "audio/mp3" || file.mimetype === "audio/mpeg"
    );

    // Generate a unique file name for the output video file
    let fileName = `${req.cookies.token}.mp4`;
    let fileNumber = 0;

    // Check if a file with the same name already exists
    while (fs.existsSync(`public/upload/${fileName}`)) {
      fileNumber++;
      fileName = `${req.cookies.token}(${fileNumber}).mp4`;
    }

    // Use ffmpeg to replace the audio of the video
    ffmpeg(`temp/${req.cookies.token}_${videoFile.originalname}`)
      .input(`temp/${req.cookies.token}_${audioFile.originalname}`)
      .audioCodec("aac")
      .save(`public/upload/${fileName}`)
      .on("error", (err) => {
        throw err;
      })
      .on("end", () => {
        // Delete the original video and audio files in the temp folder
        files.forEach((file) => {
          fs.unlink(`temp/${req.cookies.token}_${file.originalname}`, (err) => {
            if (err) {
              console.error(err);
            }
          });
        });

        res.status(201).json({ path: `public/upload/${fileName}` });
      });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

exports.mergeAllVideos = async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      throw new Error("At least two files must be uploaded");
    }

    // Create an array of the uploaded files
    const files = req.files;

    await files.forEach((file) => {
      fs.writeFileSync(
        `temp/${req.cookies.token}_${file.originalname}`,
        file.buffer
      );
    });

    // Generate a unique file name for the output video file
    let fileName = `${req.cookies.token}.mp4`;
    let fileNumber = 0;

    console.log(req.files);

    // Check if a file with the same name already exists
    while (fs.existsSync(`public/upload/${fileName}`)) {
      fileNumber++;
      fileName = `${req.cookies.token}(${fileNumber}).mp4`;
    }

    // Create a new ffmpeg command
    const command = ffmpeg();

    // Add each video file as an input
    await files.forEach((file) => {
      command.input(`temp/${req.cookies.token}_${file.originalname}`);
    });

    // Use ffmpeg to merge the video files
    command
      .mergeToFile(`public/upload/${fileName}`, "public/upload")
      .on("error", (err) => {
        throw err;
      })
      .on("end", () => {
        files.forEach((file) => {
          fs.unlink(`temp/${req.cookies.token}_${file.originalname}`, (err) => {
            if (err) {
              console.error(err);
            }
          });
        });

        res.status(201).json({
          status: "ok",
          message: "Merged All Video Successfully",
          video_file_path: `public/upload/${fileName}`,
        });
      });
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.downloadFile = async (req, res) => {
  try {
    // Get the file path from the request query
    const filePath = req.query.file_path;

    // Check if the file exists in the public/upload directory
    if (!fs.existsSync(filePath)) {
      throw new Error("File does not exist");
    }

    // Send the file for download
    res.download(filePath);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.myFileUploadedData = async (req, res) => {
  try {
    // Get the token from the request cookies
    const token = req.cookies.token;

    // Get the list of files in the public/upload directory
    const files = await fsExtra.readdir("public/upload");

    // Filter the list of files to only include those that have the token in their name
    const filteredFiles = files.filter((file) => file.includes(token));

    // Send the filtered list of files back to the client
    res.send({
      status: "ok",
      data: filteredFiles,
    });
  } catch (err) {
    res.status(500).send(err);
  }
};
