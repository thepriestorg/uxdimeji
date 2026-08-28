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

const directory = path.join("public", "projects", "stead");
const names = [
  "dashboard-light-dark",
  "dashboard-review-light-dark",
  "schedule-light-dark",
  "meeting-review-light-dark",
  "memory-light-dark",
  "memory-detail-light-dark",
  "profile-light-dark",
  "connections-light-dark",
  "boundaries-light-dark",
  "speaking-style-light-dark",
  "conversation",
];

async function upload() {
  const results = {};
  for (const name of names) {
    const file = path.join(directory, `stead-${name}.jpg`);
    const result = await cloudinary.uploader.upload(file, {
      public_id: `portfolio/stead/${name}`,
      overwrite: true,
      invalidate: true,
      resource_type: "image",
    });
    results[name] = result.secure_url;
    console.log(`Uploaded ${name}`);
  }
  fs.writeFileSync(
    path.join(directory, "cloudinary-urls.json"),
    JSON.stringify(results, null, 2),
  );
}

upload().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
