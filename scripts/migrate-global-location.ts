import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-09-01" }).withConfig({ perspective: "raw", useCdn: false });
const contactLocation = await client.fetch<Record<string, string> | null>('*[_type == "contact"][0].location');
const settingsLocation = await client.fetch<unknown>('*[_type == "siteSettings"][0].location');
if (contactLocation && typeof contactLocation === "object") {
  await client.patch("siteSettings").set({ location: { _type: "localizedString", ...contactLocation } }).commit();
} else if (typeof settingsLocation === "string") {
  await client.patch("siteSettings").set({ location: { _type: "localizedString", en: settingsLocation } }).commit();
}
console.log("siteSettings.location normalized from the current editor value");
