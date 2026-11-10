import React, { useEffect, useMemo, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { MainComposition } from "./Composition";
import { playerRef, seekTo, togglePlay } from "../playerRef";
import { projectDuration, useStore } from "../store";
import type { PreviewItem } from "../store";
import { fmtFrames } from "../time";
import { CARDS } from "../cards/registry";
import { cardFps, cardSize } from "../cards/types";
import { MANIFEST } from '../cards/projectCards';
import { themedProps } from '../theme';
import { cardName, t, useLocale, useT } from "../i18n";
import { hitTestClip } from "./dragObjects";
import { SelectionFrame } from "./SelectionFrame";

/** 素材库点击预览：占据画面区，循环播放；主工程 Player 保持挂载（display:none） */
const ItemPreview: React.FC<{ item: NonNullable<PreviewItem>; onClose: () => void }> = ({
  item,
  onClose,
}) => {
  const themeId = useStore(s => s.project.themeId);
  const themeColors = useStore(s => s.project.themeColors);
  const t = useT();
  const cardPlayer = useRef<PlayerRef>(null);
  const replay = () => {
    cardPlayer.current?.seekTo(0);
    cardPlayer.current?.play();
  };
  let body: React.ReactNode = null;
  let title = "";
  let isFilmUnit = false;
  if (item.kind === "card") {
    const card = CARDS[item.cardId];
    title = card ? cardName(card) : item.cardId;
    isFilmUnit = !!card && card.id.startsWith("proj:");
    if (card && card.kind !== "audio") {
      const { width, height } = cardSize(card);
      body = (
        <Player
          ref={cardPlayer}
          component={card.component}
          inputProps={themedProps(MANIFEST, card, themeId, {}, themeColors)}
          durationInFrames={Math.max(2, card.durationInFrames)}
          compositionWidth={width}
          compositionHeight={height}
          fps={cardFps(card)}
          autoPlay
          // Film units: play the entrance once (first 4 s), rest on the last frame; click the picture or press Replay to run it again.
          loop={!isFilmUnit}
          moveToBeginningWhenEnded={!isFilmUnit}
          {...(isFilmUnit ? { inFrame: 0, outFrame: Math.min(Math.max(2, card.durationInFrames) - 1, Math.round(cardFps(card) * 4)) } : {})}
          controls={false}
          clickToPlay={!isFilmUnit}
          numberOfSharedAudioTags={32}
          style={{ width: "100%", height: "100%" }}
          acknowledgeRemotionLicense
        />
      );
    } else {
      body = <div className="preview-audio">{t("prev.audioCard")}</div>;
    }
  } else {
    title = item.label;
    if (item.kind === "video")
      body = <video className="preview-media" src={`/${item.file}`} controls autoPlay loop />;
    else if (item.kind === "image")
      body = <img className="preview-media" src={`/${item.file}`} />;
    else
      body = (
        <div className="preview-audio">
          🔊 {item.label}
          <audio src={`/${item.file}`} controls autoPlay />
        </div>
      );
  }
  return (
    <>
      <div className="preview-stage" onClick={isFilmUnit ? replay : undefined} style={isFilmUnit ? { cursor: "pointer" } : undefined}>
        {body}
      </div>
      <div className="transport">
        <span className="preview-tag">{t("prev.tag")}</span>
        <b>{title}</b>
        <span className="dim">{t("prev.dragHint")}</span>
        {isFilmUnit && (
          <button className="btn" onClick={replay} title={t("prev.replay")}>
            ↻ {t("prev.replay")}
          </button>
        )}
        <button className="btn" style={{ marginLeft: "auto" }} onClick={onClose}>
          {t("prev.back")}
        </button>
      </div>
    </>
  );
};

/** 走带控制：唯一订阅 playhead 的预览端组件——播放中每帧只重渲染它，
 *  不能让 frameupdate 波及包含 <Player> 的父组件。 */
const Transport: React.FC<{
  duration: number;
  fps: number;
  loop: boolean;
  setLoop: (b: boolean) => void;
  sizeLabel: string;
}> = ({ duration, fps, loop, setLoop, sizeLabel }) => {
  const playhead = useStore((s) => s.playhead);
  const playing = useStore((s) => s.playing);
  const setPlayhead = useStore((s) => s.setPlayhead);
  const setPlaying = useStore((s) => s.setPlaying);

  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    const onFrame = (e: { detail: { frame: number } }) => setPlayhead(e.detail.frame);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    p.addEventListener("frameupdate", onFrame);
    p.addEventListener("play", onPlay);
    p.addEventListener("pause", onPause);
    return () => {
      p.removeEventListener("frameupdate", onFrame);
      p.removeEventListener("play", onPlay);
      p.removeEventListener("pause", onPause);
    };
  }, [setPlayhead, setPlaying]);

  return (
    <div className="transport">
      <button className="btn" title={t("prev.toStart")} onClick={() => seekTo(0)}>
        ⏮
      </button>
      <button className="btn btn-play" title={t("prev.playPause")} onClick={togglePlay}>
        {playing ? "⏸" : "▶"}
      </button>
      <span className="timecode">
        {fmtFrames(playhead, fps)} <span className="dim">/ {fmtFrames(duration, fps)}</span>
      </span>
      <input
        className="seek-bar"
        type="range"
        min={0}
        max={Math.max(1, duration - 1)}
        step={1}
        value={Math.min(playhead, Math.max(1, duration - 1))}
        title={t("prev.seek")}
        onChange={(e) => {
          const f = Number(e.target.value);
          seekTo(f);
          setPlayhead(f);
        }}
        style={{ flex: 1, minWidth: 80, margin: "0 12px" }}
      />
      <label className="loop-toggle">
        <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} />
        {t("prev.loop")}
      </label>
      <span className="dim" style={{ marginLeft: "auto" }}>
        {sizeLabel}
      </span>
    </div>
  );
};

export const PreviewPanel: React.FC = () => {
  useLocale((s) => s.locale); // 语言切换时连带走带条一起重渲染
  const project = useStore((s) => s.project);
  const previewItem = useStore((s) => s.previewItem);
  const setPreview = useStore((s) => s.setPreview);
  const [loop, setLoop] = useState(true);

  const duration = projectDuration(project);
  const inputProps = useMemo(() => ({ project }), [project]);

  // Drag objects directly on the preview: pointer down picks the clip under the cursor, move writes its x / y.
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; px: number; py: number; x: number; y: number; scale: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const onPointerDownCapture = (e: React.PointerEvent<HTMLDivElement>) => {
    const root = stageRef.current;
    const box = playerRef.current?.getContainerNode();
    if (!root || !box || e.button !== 0) return;
    const rect = box.getBoundingClientRect();
    const scale = rect.width / project.width;
    const id = hitTestClip(root, e.clientX, e.clientY, rect.width * rect.height);
    if (!id) return;
    const st = useStore.getState();
    let clip = null as null | { x: number; y: number };
    for (const tr of st.project.tracks) for (const c of tr.clips) if (c.id === id) clip = c;
    if (!clip) return;
    st.select(id);
    drag.current = { id, px: e.clientX, py: e.clientY, x: clip.x, y: clip.y, scale, moved: false };
    root.setPointerCapture(e.pointerId);
    e.stopPropagation(); // keep Player's click-to-play from firing
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.px) / d.scale;
    const dy = (e.clientY - d.py) / d.scale;
    if (!d.moved && Math.hypot(dx, dy) * d.scale < 3) return;
    const st = useStore.getState();
    if (!d.moved) { st.commit(); d.moved = true; } // one undo step per drag
    st.updateClip(d.id, { x: Math.round(d.x + dx), y: Math.round(d.y + dy) });
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (d?.moved) suppressClick.current = true;
    if (stageRef.current?.hasPointerCapture(e.pointerId)) stageRef.current.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="preview-panel">
      {previewItem && <ItemPreview item={previewItem} onClose={() => setPreview(null)} />}
      <div
        ref={stageRef}
        className="preview-stage"
        style={previewItem ? { display: "none" } : { position: "relative" }}
        onPointerDownCapture={onPointerDownCapture}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClickCapture={(e) => { if (suppressClick.current) { suppressClick.current = false; e.stopPropagation(); } }}
      >
        <Player
          ref={playerRef}
          component={MainComposition}
          inputProps={inputProps}
          durationInFrames={duration}
          compositionWidth={project.width}
          compositionHeight={project.height}
          fps={project.fps}
          loop={loop}
          controls={false}
          clickToPlay
          numberOfSharedAudioTags={32}
          style={{ width: "100%", height: "100%" }}
          acknowledgeRemotionLicense
        />
        <SelectionFrame stage={stageRef} />
      </div>
      {!previewItem && (
        <Transport
          duration={duration}
          fps={project.fps}
          loop={loop}
          setLoop={setLoop}
          sizeLabel={`${project.width}×${project.height} · ${project.fps}fps`}
        />
      )}
    </div>
  );
};
