export function browserLocale(acceptLanguage: string | null) {
  if (!acceptLanguage) return "en";
  const preferred = acceptLanguage
    .split(",")
    .map((entry, index) => {
      const [tag, ...parameters] = entry.trim().toLowerCase().split(";");
      const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith("q="));
      const quality = qualityParameter ? Number.parseFloat(qualityParameter.split("=")[1]) : 1;
      return { tag, quality: Number.isFinite(quality) ? quality : 0, index };
    })
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  const language = preferred[0]?.tag.split("-")[0];
  if (language === "ru") return "ru";
  if (language === "zh") return "zh";
  return "en";
}