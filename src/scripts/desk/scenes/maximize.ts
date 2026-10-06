import type { Scene } from '../types';
import { A0, MAX } from '../constants';
import { kf, along, rectAt, hand, pulseAt, ease } from '../dsl';

// A held window is flicked upward and let go, and it fills the screen.
const GRIP = { x: 260, y: 110 };
const LIFTED = { x: A0.x, y: A0.y - 80, w: A0.w, h: A0.h };

export const maximize: Scene = {
    id: 'maximize', length: 5400, still: 2600,
    title: 'Maximize', pose: 'Flick a held window up', how: 'Pinch a window, flick it upward and let go: it fills the screen. Flick it down to minimize it.',
    at(t) {
        const r = along(t, [[0, 640, 440], [1100, GRIP.x, GRIP.y], [1900, GRIP.x, GRIP.y], [2150, GRIP.x, GRIP.y - 80, ease.outCubic],
                            [2800, GRIP.x, GRIP.y - 80], [3600, 300, 260]]);
        const pinch = kf(t, [[1250, 0], [1500, 1, ease.linear], [2150, 1], [2250, 0, ease.linear]]);
        const held = t >= 1500 && t < 2150;
        const a = t < 2150
            ? { x: A0.x + (held ? r.x - GRIP.x : 0), y: A0.y + (held ? r.y - GRIP.y : 0), w: A0.w, h: A0.h }
            : rectAt(t, [[2250, LIFTED], [2750, MAX, ease.outCubic]]);
        return {
            a,
            terminal: 0,
            right: hand(r, { alpha: kf(t, [[0, 0], [350, 1]]), pinch, pose: pinch > 0.5 ? 'index' : 'open' }),
            frame: t > 700 && t < 3400 ? { rect: a, held: t >= 1500 && t < 2250 } : null,
            squeeze: kf(t, [[1500, 0], [1620, 1], [2250, 1], [2360, -0.8], [2600, 0]]),
            chip: t >= 1900 && t < 2700 ? { x: r.x, y: r.y + 52, text: 'Maximize', alpha: kf(t, [[1900, 0], [2050, 1], [2500, 1], [2700, 0]]) } : null,
            pulse: pulseAt(t, 2250, r)
        };
    }
};
