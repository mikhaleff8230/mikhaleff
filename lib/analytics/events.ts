export type AnalyticsEvent =
  | "view_artwork" | "open_fullscreen" | "view_series" | "click_inquire"
  | "submit_inquiry" | "change_language" | "filter_works" | "view_in_space"
  | "view_in_space_open" | "view_in_space_close" | "view_in_space_scene_change"
  | "view_in_space_true_scale_on" | "view_in_space_true_scale_off"
  | "view_in_space_resize" | "view_in_space_frame_change" | "view_in_space_fullscreen"
  | "view_in_space_custom_room";

export function trackEvent(name: AnalyticsEvent, payload: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("mikhaleff:analytics", { detail: { name, payload } }));
}
