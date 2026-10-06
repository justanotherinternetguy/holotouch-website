import type { Scene } from '../types';
import { A4, MAX } from '../constants';
import { kf, along, rectAt, hand, pulseAt, ease } from '../dsl';

// A maximized window is picked up (it comes back to its size), carried to the right edge and held
// there: a strip fills, and the window goes to the next workspace.
const GRIP = { x: 440, y: 300 };
const RESTORED = { x: GRIP.x - 200, y: GRIP.y - 140, w: 400, h: 280 };
const AT_EDGE = { x: 650, y: 160, w: 400, h: 280 };
const GONE = { x: 900, y: 160, w: 400, h: 280 };
const ARRIVING = { x: 900, y: 90, w: 500, h: 400 };

export const workspace: Scene = {
    id: 'workspace', length: 6000, still: 2800,
    title: 'Send to a workspace', pose: 'Hold at a screen edge', how: 'Carry a window to the left or right edge of the screen and wait there. It goes to the workspace on that side.',
    at(t) {
        const r = along(t, [[0, 300, 260], [600, GRIP.x, GRIP.y], [1200, GRIP.x, GRIP.y], [2200, 850, 300], [3650, 850, 300], [4400, 760, 330]]);
        const pinch = kf(t, [[600, 0], [800, 1, ease.linear], [3500, 1], [3650, 0, ease.linear]]);
        let a;
        if (t < 800) a = MAX;
        else if (t < 1100) a = rectAt(t, [[800, MAX], [1100, RESTORED, ease.outCubic]]);
        else if (t < 3500) a = { x: RESTORED.x + (r.x - GRIP.x), y: RESTORED.y + (r.y - GRIP.y), w: RESTORED.w, h: RESTORED.h };
        else if (t < 4000) a = rectAt(t, [[3500, AT_EDGE], [3900, GONE, ease.inQuad]]);
        else a = rectAt(t, [[4000, ARRIVING], [4600, A4, ease.outCubic]]);
        const edgeAlpha = kf(t, [[2100, 0], [2300, 1], [3900, 1], [4100, 0]]);
        return {
            a,
            terminal: 0,
            files: kf(t, [[3900, 1], [4100, 0]]),
            workspace: t >= 3950 ? 1 : 0,
            right: hand(r, { alpha: kf(t, [[4800, 1], [5200, 0]]), pinch, pose: pinch > 0.5 ? 'index' : 'open' }),
            frame: t >= 400 && t < 3650 ? { rect: a, held: pinch > 0.5 } : null,
            squeeze: kf(t, [[800, 0], [920, 1], [3650, 1], [3760, -0.8], [4000, 0]]),
            edge: edgeAlpha > 0 ? { side: 'right', p: kf(t, [[2300, 0], [3400, 1, ease.linear]]), done: t >= 3400, alpha: edgeAlpha } : null,
            chip: t >= 2300 && t < 3900 ? { x: 790, y: 300 + 58, text: 'Workspace 2', alpha: kf(t, [[2300, 0], [2450, 1], [3700, 1], [3900, 0]]) } : null,
            pulse: pulseAt(t, 3400, r)
        };
    }
};
