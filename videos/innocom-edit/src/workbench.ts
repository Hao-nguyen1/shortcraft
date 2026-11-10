// Manifest for the Workbench: every visible object is its own unit on its own track, so it can be selected,
// dragged on the preview, re-timed, scaled / rotated / cropped, or deleted independently.
import { BG_DEFAULTS, Background, CHIP_DEFAULTS, Chip, CTA_DEFAULTS, Cta, HEADLINE_DEFAULTS, Headline, Logo, PHOTO_DEFAULTS, Photo, SUB_DEFAULTS, Subtitle } from './objects';

const TOTAL = 450;
const text = (key: string, label: string, def: string) => ({ type: 'text' as const, key, label, default: def });
const color = (key: string, label: string, def: string) => ({ type: 'color' as const, key, label, default: def });

export const WORKBENCH = {
  name: 'Innocom · editable objects',
  fps: 30, width: 1920, height: 1080, total: TOTAL, background: '#012248',
  // listed bottom -> top: later units render above earlier ones
  shots: [
    { id: 'bg', track: 'Nền', label: 'Nền', from: 0, duration: TOTAL, component: Background, props: BG_DEFAULTS,
      schema: [color('from', 'Màu sáng', BG_DEFAULTS.from), color('to', 'Màu tối', BG_DEFAULTS.to)] },
    { id: 'team', track: 'Ảnh đội ngũ', label: 'Ảnh đội ngũ', from: 20, duration: TOTAL - 20, component: Photo, props: { ...PHOTO_DEFAULTS, file: 'img/team.webp' }, cardId: 'photo', cardName: 'Ảnh' },
    { id: 'hero', track: 'Ảnh bóng đèn', label: 'Ảnh bóng đèn', from: 50, duration: TOTAL - 50, component: Photo,
      props: { ...PHOTO_DEFAULTS, file: 'img/hero.webp', top: 500, left: 1150, width: 640, height: 357 }, cardId: 'photo', cardName: 'Ảnh' },
    { id: 'chip0', track: 'Chỉ số 1', label: 'Chỉ số 1', from: 150, duration: TOTAL - 150, component: Chip, props: { ...CHIP_DEFAULTS, index: 0 }, cardId: 'chip', cardName: 'Chỉ số',
      schema: [text('value', 'Số', CHIP_DEFAULTS.value), text('label', 'Nhãn', CHIP_DEFAULTS.label), color('color', 'Màu số', CHIP_DEFAULTS.color)] },
    { id: 'chip1', track: 'Chỉ số 2', label: 'Chỉ số 2', from: 170, duration: TOTAL - 170, component: Chip, props: { ...CHIP_DEFAULTS, index: 1, value: '3', label: 'Văn phòng: HN · HCM · KL' }, cardId: 'chip', cardName: 'Chỉ số' },
    { id: 'chip2', track: 'Chỉ số 3', label: 'Chỉ số 3', from: 190, duration: TOTAL - 190, component: Chip, props: { ...CHIP_DEFAULTS, index: 2, value: 'ISO 27001', label: 'Chứng nhận năm 2022' }, cardId: 'chip', cardName: 'Chỉ số' },
    { id: 'headline', track: 'Tiêu đề', label: 'Tiêu đề', from: 10, duration: TOTAL - 10, component: Headline, props: HEADLINE_DEFAULTS,
      schema: [text('text', 'Nội dung', HEADLINE_DEFAULTS.text), { type: 'number' as const, key: 'size', label: 'Cỡ chữ', default: HEADLINE_DEFAULTS.size, min: 40, max: 180, step: 2, unit: 'px' }, color('color', 'Màu chữ', HEADLINE_DEFAULTS.color)] },
    { id: 'sub', track: 'Phụ đề', label: 'Dòng giới thiệu', from: 110, duration: TOTAL - 110, component: Subtitle, props: SUB_DEFAULTS,
      schema: [text('text', 'Nội dung', SUB_DEFAULTS.text), color('color', 'Màu chữ', SUB_DEFAULTS.color)] },
    { id: 'logo', track: 'Logo', label: 'Logo', from: 0, duration: TOTAL, component: Logo },
    { id: 'cta', track: 'Nút kêu gọi', label: 'Nút kêu gọi', from: 280, duration: TOTAL - 280, component: Cta, props: CTA_DEFAULTS,
      schema: [text('text', 'Chữ trên nút', CTA_DEFAULTS.text), color('color', 'Màu nút', CTA_DEFAULTS.color)] },
  ],
};
