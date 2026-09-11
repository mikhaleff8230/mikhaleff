const copy = {
  en: {
    nav: ["Works", "Collections", "Exhibitions", "About", "Journal", "Contact"],
    collections: "Collections", back: "Back", backToCollections: "Back to collections", viewSeries: "View collection", viewCollection: "View collection", featuredCollection: "Featured collection", exploreCollection: "Explore collection", viewExhibition: "View exhibition",
    readArticle: "Read article", selectedWorks: "Selected works", allWorks: "All works",
  },
  ru: {
    nav: ["Работы", "Коллекции", "Выставки", "Об авторе", "Журнал", "Контакты"],
    collections: "Коллекции", back: "Назад", backToCollections: "Назад к коллекциям", viewSeries: "Смотреть коллекцию", viewCollection: "Смотреть коллекцию", featuredCollection: "Избранная коллекция", exploreCollection: "Открыть коллекцию", viewExhibition: "Открыть выставку",
    readArticle: "Читать", selectedWorks: "Избранные работы", allWorks: "Все работы",
  },
  zh: {
    nav: ["作品", "收藏", "展览", "关于", "日志", "联系"],
    collections: "收藏", back: "返回", backToCollections: "返回收藏", viewSeries: "查看收藏", viewCollection: "查看收藏", featuredCollection: "精选收藏", exploreCollection: "探索收藏", viewExhibition: "查看展览",
    readArticle: "阅读", selectedWorks: "精选作品", allWorks: "全部作品",
  },
} as const;

export function getInterfaceCopy(locale: string) {
  return copy[locale as keyof typeof copy] ?? copy.en;
}
