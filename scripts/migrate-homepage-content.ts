import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-09-01" }).withConfig({ perspective: "raw", useCdn: false });
const query = '*[_type == "homepage"]{_id, "exhibitionsImage": coalesce(exhibitionsImage, selectedExhibitions[0]->cover, *[_type == "exhibition"] | order(startDate desc)[0].cover)}';
const homepages = await client.fetch<Array<{ _id: string; exhibitionsImage?: unknown }>>(query);

const localized = (en: string, ru: string, zh: string) => ({ en, ru, zh });

for (const homepage of homepages) {
  const values: Record<string, unknown> = {
    statementEyebrow: localized("Art as a state of consciousness", "Искусство как состояние сознания", "艺术作为意识状态"),
    statementLinkLabel: localized("About the artist", "Об авторе", "关于艺术家"),
    selectedWorksEyebrow: localized("Selected works", "Избранные картины", "精选作品"),
    selectedWorksLinkLabel: localized("View all works", "Все картины", "查看全部作品"),
    selectedWorksNote: localized("Painting is a way\nto be closer to the real.", "Живопись — это способ\nстать ближе к реальному.", "绘画是一种\n接近真实的方式。"),
    featuredEyebrow: localized("Featured collection", "Избранная коллекция", "精选收藏"),
    featuredLinkLabel: localized("Explore collection", "Открыть коллекцию", "探索收藏"),
    exhibitionsEyebrow: localized("Exhibitions", "Выставки", "展览"),
    exhibitionsTitle: localized("Recent Exhibitions", "Последние выставки", "近期展览"),
    exhibitionsNote: localized("A continuing dialogue through exhibitions, across cities and cultures.", "Непрерывный диалог через выставки, города и культуры.", "通过展览、城市与文化持续对话。"),
    exhibitionsLinkLabel: localized("View all exhibitions", "Все выставки", "查看全部展览"),
    contactTitle: localized("Art\nBeyond\nForm", "Искусство\nза пределами\nформы", "超越\n形式的\n艺术"),
    contactHeading: localized("Get in Touch", "Связаться", "联系我们"),
    contactEyebrow: localized("For inquiries, collaborations\nor exhibition opportunities", "Для запросов, сотрудничества\nи выставочных предложений", "咨询、合作\n与展览机会"),
    contactLinkLabel: localized("Contact", "Контакты", "联系"),
  };
  if (homepage.exhibitionsImage) values.exhibitionsImage = homepage.exhibitionsImage;
  await client.patch(homepage._id).setIfMissing(values).commit();
  console.log(homepage._id + ": homepage editorial fields initialized");
}