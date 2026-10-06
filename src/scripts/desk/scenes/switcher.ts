import type { Scene, Card } from '../types';
import { A4, FILES, TERMINAL, cardSlot } from '../constants';
import { kf, along, rectAt, hand, pulseAt, ease } from '../dsl';

// A fist is brought to the chin and every window becomes a card. Pointing at one and pinching
// goes to it, wherever it is.
const SLOT = [cardSlot(0), cardSlot(1), cardSlot(2)];
const PICK = { x: SLOT[1].x + SLOT[1].w / 2, y: SLOT[1].y + SLOT[1].h / 2 };
const FILES_AWAY = { x: -260, y: FILES.y, w: FILES.w, h: FILES.h };

export const switcher: Scene = {
    id: 'switcher', length: 6200, still: 3300,
    title: 'Window switcher', pose: 'Fist to chin', how: 'Touch a fist to your chin and every window, on every workspace, becomes a card. Point at one and pinch to go to it.',
    at(t) {
        const r = along(t, [[0, 700, 480], [800, 440, 330], [1300, 440, 44], [2400, 440, 44], [3200, PICK.x, PICK.y], [4000, PICK.x, PICK.y], [4600, 560, 380]]);
        const pinch = kf(t, [[3500, 0], [3700, 1, ease.linear], [3900, 1], [4000, 0, ease.linear]]);
        const shut = t >= 3700;
        const aimed = t >= 2800 && !shut;
        let cards: Card[] | null = null;
        if (t >= 1500 && t < 4200) {
            cards = [
                { id: 'browser', rect: rectAt(t, [[1500, A4], [1900, SLOT[0], ease.outCubic]]), alpha: kf(t, [[3700, 1], [3950, 0]]) },
                {
                    id: 'files', alpha: kf(t, [[4050, 1], [4200, 0]]), aimed, picked: shut && t < 4100,
                    rect: shut ? rectAt(t, [[3700, SLOT[1]], [4100, FILES, ease.outCubic]]) : rectAt(t, [[1550, FILES_AWAY], [1950, SLOT[1], ease.outCubic]])
                },
                { id: 'terminal', rect: rectAt(t, [[1600, TERMINAL], [2000, SLOT[2], ease.outCubic]]), alpha: kf(t, [[1600, 0], [1800, 1], [3700, 1], [3950, 0]]) }
            ];
        }
        return {
            a: A4,
            terminal: 0,
            browser: kf(t, [[1500, 1], [1700, 0]]),
            files: kf(t, [[4000, 0], [4150, 1]]),
            workspace: t >= 4000 ? 0 : 1,
            scrollOffset: 90,
            right: hand(r, {
                alpha: kf(t, [[0, 0], [350, 1], [5000, 1], [5400, 0]]), pinch,
                pose: t >= 800 && t < 2400 ? 'fist' : pinch > 0.5 ? 'index' : 'open'
            }),
            dim: kf(t, [[1500, 0], [1800, 0.5], [3700, 0.5], [4000, 0]]),
            cards,
            frame: t >= 4200 && t < 5000 ? { rect: FILES, held: false } : null,
            pulse: pulseAt(t, 3700, r)
        };
    }
};
