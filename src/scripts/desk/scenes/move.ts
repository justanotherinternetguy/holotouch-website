import type { Scene } from '../types';
import { A0 } from '../constants';
import { kf, along, hand, pulseAt, ease } from '../dsl';

export const move: Scene = {
    id: 'move', length: 5200, still: 2400,
    title: 'Move a window', pose: 'Thumb + index pinch', how: 'Pinch over a window and carry it. A quick pinch brings it to the front.',
    at(t) {
        const at = along(t, [[0, 640, 440], [1100, 250, 190], [1700, 250, 190], [3000, 390, 226]]);
        const pinch = kf(t, [[1250, 0], [1500, 1, ease.linear], [3300, 1], [3450, 0, ease.linear]]);
        const carried = t >= 1700;
        const a = { x: A0.x + (carried ? at.x - 250 : 0), y: A0.y + (carried ? at.y - 190 : 0), w: A0.w, h: A0.h };
        return {
            a,
            right: hand(at, { alpha: kf(t, [[0, 0], [350, 1]]), pinch, pose: pinch > 0.5 ? 'index' : 'open' }),
            frame: t > 700 ? { rect: a, held: t >= 1500 && t < 3450 } : null,
            squeeze: kf(t, [[1500, 0], [1620, 1], [3450, 1], [3560, -0.8], [3800, 0]]),
            pulse: pulseAt(t, 3450, at)
        };
    }
};
