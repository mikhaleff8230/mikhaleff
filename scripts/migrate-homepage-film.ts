import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-09-25" }).withConfig({ perspective: "raw", useCdn: false });
const homepage = await client.fetch<{_id: string} | null>('*[_type == "homepage"][0]{_id}');
const source = await client.fetch<{videoFile?: unknown; videoPoster?: unknown; mainImage?: unknown} | null>(
  '*[_type == "artwork" && defined(videoFile.asset)][0]{videoFile, videoPoster, mainImage}',
);

if (!homepage) throw new Error("Homepage document not found");

const localized = (en: string, ru: string, zh: string) => ({ _type: "localizedString", en, ru, zh });
const localizedText = (en: string, ru: string, zh: string) => ({ _type: "localizedText", en, ru, zh });
const values: Record<string, unknown> = {
  filmEnabled: true,
  filmEyebrow: localized("The process", "Процесс", "创作过程"),
  filmTitle: localized("Between Matter and Memory", "Между материей и памятью", "物质与记忆之间"),
  filmCaption: localizedText("A short film on art, process and perception.", "Короткий фильм об искусстве, процессе и восприятии.", "一部关于艺术、创作过程与感知的短片。"),
  filmLinkLabel: localized("Watch full video", "Смотреть видео", "观看完整视频"),
};
if (source?.videoFile) values.filmFile = source.videoFile;
if (source?.videoPoster || source?.mainImage) values.filmPoster = source.videoPoster || source.mainImage;

await client.patch(homepage._id).setIfMissing(values).commit({ visibility: "sync" });
console.log(`${homepage._id}: homepage film initialized (${source?.videoFile ? "video copied" : "text only"})`);