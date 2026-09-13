import { createReadStream } from "node:fs";
import { resolve } from "node:path";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-09-12" });
const source = resolve(".tmp/mikhaleff-video-026-h264.mp4");
const documentId = "artwork-untitled-026";
const asset = await client.assets.upload("file", createReadStream(source), { filename: "untitled-026-web-h264.mp4", contentType: "video/mp4" });
await client.patch(documentId).set({ videoFile: { _type: "file", asset: { _type: "reference", _ref: asset._id } } }).commit();
console.log(JSON.stringify({ documentId, assetId: asset._id, url: asset.url }, null, 2));