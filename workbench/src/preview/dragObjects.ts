/** Direct manipulation on the preview: pick the clip whose visible content is under the pointer and drag it
 *  (writes the clip's x / y layer offset). Works on any project because it hit-tests the rendered DOM:
 *  every layer wrapper carries data-clip-id, and descendants that cover most of the frame (backgrounds) are skipped,
 *  so full-frame scenes stay selectable from the timeline while objects can be grabbed on the canvas. */
export const FRAME_SKIP_RATIO = 0.85;

export const hitTestClip = (root: HTMLElement, px: number, py: number, frameArea: number): string | null => {
  const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-clip-id]")).reverse(); // later in DOM = on top
  for (const layer of layers) {
    const els = Array.from(layer.querySelectorAll<Element>("*")).reverse();
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      if (px < r.left || px > r.right || py < r.top || py > r.bottom) continue;
      if (r.width * r.height > frameArea * FRAME_SKIP_RATIO) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || Number(cs.opacity) < 0.05) continue;
      return layer.dataset.clipId ?? null;
    }
  }
  return null;
};
