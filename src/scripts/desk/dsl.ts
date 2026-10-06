import type { HandState } from './types';
export { kf, along, rectAt, lerpRect, ease } from '../motion/ease';

export function hand(at: { x: number; y: number }, more: Partial<HandState> = {}): HandState {
    return { x: at.x, y: at.y, alpha: 1, pinch: 0, idle: 0, pose: 'open', ...more };
}

/** The mint ring every finished action ends with. */
export function pulseAt(t: number, when: number, at: { x: number; y: number }) {
    const p = (t - when) / 320;
    return p >= 0 && p <= 1 ? { x: at.x, y: at.y, p } : null;
}
