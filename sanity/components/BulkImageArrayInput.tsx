import { useRef, useState } from "react";
import { insert, PatchEvent, setIfMissing, useClient, type ArrayOfObjectsInputProps } from "sanity";

export function BulkImageArrayInput(props: ArrayOfObjectsInputProps) {
  const client = useClient({ apiVersion: "2026-09-12" });
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true); setError("");
    try {
      const items = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const asset = await client.assets.upload("image", file, { filename: file.name });
        items.push({ _key: crypto.randomUUID().replaceAll("-", "").slice(0, 12), _type: "imageWithMetadata", asset: { _type: "reference", _ref: asset._id } });
      }
      if (items.length) props.onChange(PatchEvent.from([setIfMissing([]), insert(items, "after", [-1])]));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Upload failed"); }
    finally { setUploading(false); if (input.current) input.current.value = ""; }
  };

  return <div>
    <button type="button" disabled={uploading} onClick={() => input.current?.click()} style={{ width: "100%", marginBottom: 12, padding: "12px 16px", border: "1px solid currentColor", borderRadius: 3, background: "transparent", cursor: uploading ? "wait" : "pointer" }}>{uploading ? "Uploading images…" : "Upload several images"}</button>
    <input ref={input} type="file" accept="image/*" multiple hidden onChange={(event) => void upload(event.currentTarget.files)} />
    {error && <p style={{ color: "var(--card-critical-fg-color)", fontSize: 13 }}>{error}</p>}
    {props.renderDefault(props)}
  </div>;
}