import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// Every component below draws ONE object at its home position on a transparent full-frame layer.
// The Workbench moves / scales / rotates / crops the whole layer, so each object is draggable on its own.
const FONT = '"Noto Sans","Helvetica Neue",Arial,sans-serif';
const useIn = (delay = 0) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: { damping: 15, stiffness: 140, mass: 0.8 } });
};

export const BG_DEFAULTS = { from: '#0b3d84', to: '#012248' };
export const Background: React.FC<Partial<typeof BG_DEFAULTS>> = ({ from = BG_DEFAULTS.from, to = BG_DEFAULTS.to }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 1500px 950px at 1500px 300px, ${from}, ${to} 70%)` }}>
      <AbsoluteFill style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.07) 2px, transparent 2px)', backgroundSize: '60px 60px', backgroundPosition: `0 ${f * 0.3}px` }} />
    </AbsoluteFill>
  );
};

export const Logo: React.FC = () => {
  const k = useIn(0);
  return <Img src={staticFile('img/logo.png')} style={{ position: 'absolute', left: 100, top: 70, width: 300, opacity: k, transform: `translateY(${(1 - k) * -30}px)` }} />;
};

export const HEADLINE_DEFAULTS = { text: 'Hỗ trợ doanh nghiệp số chuyển đổi AI', size: 104, color: '#ffffff' };
export const Headline: React.FC<Partial<typeof HEADLINE_DEFAULTS>> = ({ text = HEADLINE_DEFAULTS.text, size = HEADLINE_DEFAULTS.size, color = HEADLINE_DEFAULTS.color }) => {
  const f = useCurrentFrame();
  const words = text.split(' ');
  return (
    <div style={{ position: 'absolute', left: 100, top: 290, width: 1000, fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.05, letterSpacing: -2, color }}>
      {words.map((w, i) => {
        const k = interpolate(f, [i * 4, i * 4 + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return <span key={i} style={{ display: 'inline-block', marginRight: '0.28em', opacity: k, transform: `translateY(${(1 - k) * 50}px)` }}>{w}</span>;
      })}
    </div>
  );
};

export const SUB_DEFAULTS = { text: 'Innocom · Hà Nội · từ năm 2014', size: 44, color: '#a9bbd6' };
export const Subtitle: React.FC<Partial<typeof SUB_DEFAULTS>> = ({ text = SUB_DEFAULTS.text, size = SUB_DEFAULTS.size, color = SUB_DEFAULTS.color }) => {
  const k = useIn(0);
  return <div style={{ position: 'absolute', left: 100, top: 640, fontFamily: FONT, fontWeight: 600, fontSize: size, color, opacity: k, transform: `translateY(${(1 - k) * 24}px)` }}>{text}</div>;
};

export const CHIP_DEFAULTS = { value: '2014', label: 'Năm thành lập', index: 0, color: '#7db2ff' };
export const Chip: React.FC<Partial<typeof CHIP_DEFAULTS>> = ({ value = CHIP_DEFAULTS.value, label = CHIP_DEFAULTS.label, index = 0, color = CHIP_DEFAULTS.color }) => {
  const k = useIn(0);
  return (
    <div style={{ position: 'absolute', left: 100 + index * 380, top: 790, width: 350, padding: '24px 30px', borderRadius: 24, background: 'rgba(255,255,255,.1)', border: '2px solid rgba(255,255,255,.25)', fontFamily: FONT, opacity: k, transform: `translateY(${(1 - k) * 60}px)` }}>
      <div style={{ fontSize: 52, fontWeight: 800, color, lineHeight: 1, whiteSpace: 'nowrap' }}>{value}</div>
      <div style={{ fontSize: 28, color: '#f5f7fb', marginTop: 8 }}>{label}</div>
    </div>
  );
};

export const PHOTO_DEFAULTS = { file: 'img/team.webp', left: 1000, top: 150, width: 820, height: 300, caption: '' };
export const Photo: React.FC<Partial<typeof PHOTO_DEFAULTS>> = ({ file = PHOTO_DEFAULTS.file, left = PHOTO_DEFAULTS.left, top = PHOTO_DEFAULTS.top, width = PHOTO_DEFAULTS.width, height = PHOTO_DEFAULTS.height }) => {
  const k = useIn(0);
  return (
    <div style={{ position: 'absolute', left, top, width, height, borderRadius: 24, overflow: 'hidden', border: '2px solid rgba(255,255,255,.3)', boxShadow: '0 30px 80px rgba(0,0,0,.5)', opacity: k, transform: `translateX(${(1 - k) * 160}px)` }}>
      <Img src={staticFile(file)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
};

export const CTA_DEFAULTS = { text: 'Đăng ký tư vấn →', color: '#dc143c' };
export const Cta: React.FC<Partial<typeof CTA_DEFAULTS>> = ({ text = CTA_DEFAULTS.text, color = CTA_DEFAULTS.color }) => {
  const k = useIn(0);
  const pulse = 1 + Math.sin(useCurrentFrame() / 7) * 0.02;
  return (
    <div style={{ position: 'absolute', left: 1300, top: 900, padding: '26px 60px', borderRadius: 999, background: color, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 50, boxShadow: '0 20px 60px rgba(220,20,60,.45)', opacity: k, transform: `scale(${(0.7 + k * 0.3) * pulse})` }}>{text}</div>
  );
};
