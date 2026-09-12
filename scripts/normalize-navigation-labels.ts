import {getCliClient} from "sanity/cli";

const client = getCliClient({apiVersion: "2026-09-01"}).withConfig({useCdn: false});

const defaults = [
  {key: "works", aliases: ["works", "artworks"], en: "Works", ru: "Картины", zh: "作品"},
  {key: "collections", aliases: ["collections", "series"], en: "Collections", ru: "Коллекции", zh: "收藏"},
  {key: "exhibitions", aliases: ["exhibitions"], en: "Exhibitions", ru: "Выставки", zh: "展览"},
  {key: "about", aliases: ["about"], en: "About", ru: "Об авторе", zh: "关于"},
  {key: "journal", aliases: ["journal"], en: "Journal", ru: "Журнал", zh: "日志"},
  {key: "contact", aliases: ["contact"], en: "Contact", ru: "Контакты", zh: "联系"},
] as const;

type NavigationItem = {
  _key?: string;
  _type?: string;
  key?: string;
  label?: {_type?: string; en?: string; ru?: string; zh?: string};
};

const settings = await client.fetch<{_id: string; navigationLabels?: NavigationItem[]} | null>(
  `*[_type == "siteSettings"][0]{_id, navigationLabels}`,
);
if (!settings) throw new Error("Site settings document was not found.");

const navigationLabels = defaults.map((entry) => {
  const current = settings.navigationLabels?.find((item) => item.key && entry.aliases.includes(item.key as never));
  return {
    _key: current?._key ?? entry.key,
    _type: "object",
    key: entry.key,
    label: {
      _type: "localizedString",
      en: current?.label?.en || entry.en,
      ru: current?.label?.ru || entry.ru,
      zh: current?.label?.zh || entry.zh,
    },
  };
});

await client.patch(settings._id).set({navigationLabels}).commit({visibility: "sync"});
console.log("Navigation labels normalized for EN, RU and 中文.");
