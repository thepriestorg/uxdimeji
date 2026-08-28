const fs = require("fs");
const path = require("path");
const { v2: cloudinary } = require("cloudinary");

const env = Object.fromEntries(
  fs
    .readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.trim().startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      let value = line.slice(index + 1).trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      return [line.slice(0, index).trim(), value];
    }),
);

cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function upload() {
  const splash = await cloudinary.uploader.upload(
    path.join("public", "projects", "stead", "stead-splash-flow.jpg"),
    {
      public_id: "portfolio/stead/splash-flow",
      overwrite: true,
      invalidate: true,
      resource_type: "image",
    },
  );
  console.log("Uploaded splash flow");

  const video = await cloudinary.uploader.upload(
    String.raw`C:\Users\HP\Downloads\AI_Bg_053-ezgif.com-gif-to-mp4-converter.mp4`,
    {
      public_id: "portfolio/stead/featured-video-4x3",
      overwrite: true,
      invalidate: true,
      resource_type: "video",
      format: "mp4",
      transformation: [
        {
          width: 1600,
          height: 1200,
          crop: "pad",
          background: "rgb:F2F0F8",
          video_codec: "h264",
          audio_codec: "aac",
        },
      ],
    },
  );
  console.log(`Uploaded 4:3 featured video: ${video.width}x${video.height}`);

  fs.writeFileSync(
    path.join("public", "projects", "stead", "cloudinary-extras.json"),
    JSON.stringify(
      {
        splash: splash.secure_url,
        featuredVideo: video.secure_url,
        featuredVideoWidth: video.width,
        featuredVideoHeight: video.height,
        featuredVideoDuration: video.duration,
      },
      null,
      2,
    ),
  );
}

upload().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
