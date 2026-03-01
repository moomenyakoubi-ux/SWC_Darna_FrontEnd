import { parseAspectRatio } from './parseAspectRatio';

export function getMediaArray(item) {
  if (!item) return [];
  if (Array.isArray(item.mediaItems) && item.mediaItems.length) return item.mediaItems;
  if (Array.isArray(item.media_items) && item.media_items.length) return item.media_items;
  return [];
}

export function getFirstMedia(item) {
  const arr = getMediaArray(item);
  return arr.length ? arr[0] : null;
}

export function getBestMediaInfo(item, defaultAspectRatio = 4 / 5) {
  const m = getFirstMedia(item);

  const uri =
    m?.publicUrl ||
    m?.public_url ||
    m?.url ||
    item?.publicUrl ||
    item?.public_url ||
    item?.image_url ||
    item?.image ||
    null;

  const width = Number(m?.width ?? item?.width);
  const height = Number(m?.height ?? item?.height);

  const arFromMedia =
    parseAspectRatio(m?.aspectRatio) ||
    parseAspectRatio(m?.aspect_ratio);

  const arFromRatioKey =
    parseAspectRatio(m?.ratio_key) ||
    parseAspectRatio(m?.ratioKey);

  const arFromWH =
    Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0
      ? width / height
      : null;

  const ar =
    arFromMedia || arFromRatioKey || arFromWH || defaultAspectRatio;

  return {
    uri,
    aspectRatio: ar,
    width: Number.isFinite(width) ? width : null,
    height: Number.isFinite(height) ? height : null,
    media: m,
  };
}
