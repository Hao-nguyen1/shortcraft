import React, { useEffect, useState } from "react";
import { playerRef } from "../playerRef";
import { useStore } from "../store";
import { FRAME_SKIP_RATIO } from "./dragObjects";

type Box = { l: number; t: number; w: number; h: number; label: string };

/** Outline of the selected clip's visible content on the preview (union of its rendered elements, skipping
 *  full-frame backgrounds), so it is clear which object — and how much of the picture — is in scope.
 *  Subscribes to the playhead on purpose: the box follows the object while it animates or is dragged. */
export const SelectionFrame: React.FC<{ stage: React.RefObject<HTMLDivElement | null> }> = ({ stage }) => {
  const id = useStore((s) => s.selectedClipId);
  const playhead = useStore((s) => s.playhead);
  const project = useStore((s) => s.project);
  const [box, setBox] = useState<Box | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const root = stage.current;
      const player = playerRef.current?.getContainerNode();
      const layer = id && root ? root.querySelector<HTMLElement>(`[data-clip-id="${id}"]`) : null;
      if (!root || !player || !layer) return setBox(null);
      const fr = player.getBoundingClientRect();
      const sr = root.getBoundingClientRect();
      let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
      for (const el of Array.from(layer.querySelectorAll<Element>("*"))) {
        const q = el.getBoundingClientRect();
        if (q.width < 4 || q.height < 4 || q.width * q.height > fr.width * fr.height * FRAME_SKIP_RATIO) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || Number(cs.opacity) < 0.05) continue;
        l = Math.min(l, q.left); t = Math.min(t, q.top); r = Math.max(r, q.right); b = Math.max(b, q.bottom);
      }
      if (!isFinite(l)) return setBox(null);
      let label = "";
      for (const tr of project.tracks) for (const c of tr.clips) if (c.id === id) label = c.label ?? c.cardId;
      const next = { l: Math.round(l - sr.left), t: Math.round(t - sr.top), w: Math.round(r - l), h: Math.round(b - t), label };
      setBox((p) => (p && p.l === next.l && p.t === next.t && p.w === next.w && p.h === next.h && p.label === next.label ? p : next));
    });
    return () => cancelAnimationFrame(raf);
  }, [id, playhead, project, stage]);

  if (!box) return null;
  const labelAbove = box.t > 22;
  return (
    <div
      className="selection-frame"
      style={{ position: "absolute", left: box.l - 2, top: box.t - 2, width: box.w + 4, height: box.h + 4, border: "2px solid #ffb020", borderRadius: 4, pointerEvents: "none", boxShadow: "0 0 0 1px rgba(0,0,0,.45)", zIndex: 5 }}
    >
      <span style={{ position: "absolute", left: -2, ...(labelAbove ? { top: -22 } : { top: 2 }), background: "#ffb020", color: "#1a1200", font: "600 11px/18px system-ui, sans-serif", padding: "0 7px", borderRadius: 3, whiteSpace: "nowrap" }}>
        {box.label}
      </span>
    </div>
  );
};
