import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-09-01" }).withConfig({ perspective: "raw", useCdn: false });
const worksHero = await client.fetch<unknown>('*[_type == "homepage"][0].heroImageOverride');
const l = (en: string, ru: string, zh: string) => ({ en, ru, zh });
const page = (eyebrow: [string,string,string], title: [string,string,string], subtitle: [string,string,string], note?: [string,string,string], ctaLabel?: [string,string,string], heroImage?: unknown) => ({
  _type: "archivePageSettings", eyebrow: l(...eyebrow), title: l(...title), subtitle: l(...subtitle),
  ...(note ? { note: l(...note) } : {}), ...(ctaLabel ? { ctaLabel: l(...ctaLabel) } : {}), ...(heroImage ? { heroImage } : {}),
});
await client.createIfNotExists({ _id: "archivePages", _type: "archivePages" });
await client.patch("archivePages").setIfMissing({
  works: page(["/ Works","/ Картины","/ 作品"], ["Paintings","Картины","绘画"], ["Fragments of a larger consciousness","Фрагменты большего сознания","更广阔意识的碎片"], ["Each painting is a trace of a state — a moment between structure and freedom, form and formlessness.","Каждая картина — след состояния, момент между структурой и свободой, формой и бесформенностью.","每幅画都是一种状态的痕迹——结构与自由、形式与无形之间的瞬间。"], ["Explore the works","Смотреть картины","探索作品"], worksHero),
  collections: page(["/ Collections","/ Коллекции","/ 收藏"], ["Collections","Коллекции","收藏"], ["Different states. One continuous exploration.","Разные состояния. Одно непрерывное исследование.","不同的状态，一场持续的探索。"], ["Each collection is a chapter in an ongoing search — a reflection of inner landscapes, material experiments and evolving states of perception.","Каждая коллекция — глава продолжающегося поиска, отражение внутренних ландшафтов, материальных экспериментов и меняющихся состояний восприятия.","每个收藏都是持续探索的一章，映照内在景观、材料实验与不断变化的感知状态。"]),
  exhibitions: page(["/ Exhibitions","/ Выставки","/ 展览"], ["Exhibitions","Выставки","展览"], ["Solo and group exhibitions. A continuing dialogue.","Персональные и групповые выставки. Продолжающийся диалог.","个展与群展，一场持续的对话。"]),
  journal: page(["/ Journal","/ Журнал","/ 日志"], ["Journal","Журнал","日志"], ["Studio notes, conversations and fragments of process.","Заметки из мастерской, беседы и фрагменты процесса.","工作室笔记、对话与创作过程片段。"]),
}).commit();
if (worksHero) await client.patch("archivePages").setIfMissing({ "works.heroImage": worksHero }).commit();
console.log("archivePages: initialized without overwriting existing values");
