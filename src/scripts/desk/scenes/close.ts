import type { Scene } from '../types';
import { A0, A2, TERMINAL } from '../constants';
import { kf, along, hand, pulseAt, lerpRect, ease } from '../dsl';

export const close: Scene = {
    id: 'close', length: 4900, still: 1500,
    title: 'Close a window', pose: 'Fist, held still', how: 'Hold a fist over the window and a ring fills for about 0.7 s. Moving or opening the hand cancels it.',
    at(t) {
        const r = along(t, [[0, 664, 202], [700, 700, 190]]);
        const leaving = kf(t, [[3500, 1], [3850, 0]]);
        const home = kf(t, [[3800, 0], [4600, 1]]);
        return {
            // With the terminal gone the hands leave, and the browser goes back to where it began.
            a: lerpRect(A2, A0, home),
            terminal: kf(t, [[1800, 1], [2020, 0]]),
            right: hand(r, { alpha: leaving, pose: t >= 900 && t < 2400 ? 'fist' : 'open' }),
            left: hand({ x: 150, y: 440 }, { alpha: leaving, idle: 1 }),
            frame: t < 1800 ? { rect: TERMINAL, held: false } : null,
            hold: t >= 1000 && t < 2150 ? {
                x: r.x, y: r.y, p: kf(t, [[1100, 0], [1800, 1, ease.linear]]), done: t >= 1800,
                pop: kf(t, [[1800, 1], [1880, 1.16], [2000, 1]]), alpha: kf(t, [[1000, 0], [1100, 1], [2000, 1], [2150, 0]])
            } : null,
            pulse: pulseAt(t, 1800, r)
        };
    }
};
