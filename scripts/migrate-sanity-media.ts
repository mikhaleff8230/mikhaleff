import { getCliClient } from "sanity/cli";
const client = getCliClient({ apiVersion: "2026-09-12" });
type LegacyImage = { _key?: string; _type?: string; asset?: unknown; [key: string]: unknown };
const artworks = await client.fetch<Array<{_id:string; detailImages?:LegacyImage[]; textureImages?:LegacyImage[]; interiorImages?:LegacyImage[]}>>(`*[_type == "artwork"]{_id,detailImages,textureImages,interiorImages}`);
let repaired = 0;
for (const artwork of artworks) {
  const patch: Record<string, LegacyImage[]> = {};
  for (const field of ["detailImages", "textureImages", "interiorImages"] as const) {
    const images = artwork[field]; if (!images?.length) continue;
    const normalized = images.map((image) => image._type === "image" ? { ...image, _type: "imageWithMetadata" } : image);
    if (normalized.some((image, index) => image._type !== images[index]._type)) patch[field] = normalized;
  }
  if (Object.keys(patch).length) { await client.patch(artwork._id).set(patch).commit(); repaired += 1; }
}
const contact = await client.getDocument<Record<string, unknown>>("contact");
if (contact) await client.patch("contact").setIfMissing({
  eyebrow: { _type: "localizedString", en: "/ Contact", ru: "/ Контакты", zh: "/ 联系" },
  displayTitle: { _type: "localizedString", en: "Art\nBeyond\nForm", ru: "Искусство\nвне\nформы", zh: "超越\n形式的\n艺术" },
  heading: { _type: "localizedString", en: "Get in Touch", ru: "Связаться", zh: "联系" },
  introduction: { _type: "localizedText", en: "For inquiries, collaborations and exhibition opportunities.", ru: "По вопросам приобретения, сотрудничества и выставочных проектов.", zh: "用于作品咨询、合作与展览机会。" },
}).commit();
const about = await client.getDocument<Record<string, unknown>>("about");
if (about) await client.patch("about").setIfMissing({
  pageEyebrow: { _type: "localizedString", en: "/ About", ru: "/ Об авторе", zh: "/ 关于" },
  pageTitle: { _type: "localizedString", en: "About\nthe Artist", ru: "Об\nавторе", zh: "关于\n艺术家" },
  introduction: { _type: "localizedText", en: "My work is a continuous exploration of the space between the visible and the invisible. Through abstraction I seek to express states, emotions and structures that exist beyond rational perception.", ru: "Моя работа — непрерывное исследование пространства между видимым и невидимым. Через абстракцию я стремлюсь выражать состояния, эмоции и структуры за пределами рационального восприятия.", zh: "我的创作持续探索可见与不可见之间的空间，并通过抽象表达理性认知之外的状态、情感与结构。" },
  readBiographyLabel: { _type: "localizedString", en: "Read full biography", ru: "Читать биографию", zh: "阅读完整传记" },
  studioTitle: { _type: "localizedString", en: "Between matter\nand memory", ru: "Между материей\nи памятью", zh: "物质与\n记忆之间" },
  studioText: { _type: "localizedText", en: "The studio is treated as a field of attention: a place where gesture, accident and revision are allowed to remain visible.", ru: "Студия становится полем внимания — местом, где жест, случайность и исправления остаются видимыми.", zh: "工作室是一片专注之地：动作、偶然与修改都被允许保留其可见痕迹。" },
}).commit();
console.log(`Repaired image arrays in ${repaired} artwork documents and normalized Contact/About defaults.`);