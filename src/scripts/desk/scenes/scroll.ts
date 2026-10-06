import type { Scene } from '../types';
import { A4 } from '../constants';
import { kf, along, hand } from '../dsl';

// Two fingers up, tipped at the screen: the page under the hand scrolls, faster the further they tip.
export const scroll: Scene = {
    id: 'scroll', length: 5200, still: 2400,
    title: 'Scroll', pose: 'Two fingers up', how: 'Tip the two fingers at the screen to scroll down, straighten them up to scroll up: the further, the faster.',
    at(t) {
        const r = along(t, [[0, 700, 480], [1000, 440, 300], [4600, 440, 300], [5200, 520, 420]]);
        const v = kf(t, [[1300, 0], [1700, 1], [3000, 1], [3300, 0], [3600, -0.6], [4300, -0.6], [4600, 0]]);
        return {
            a: A4,
            terminal: 0,
            files: 0,
            workspace: 1,
            right: hand(r, {
                alpha: kf(t, [[0, 0], [350, 1], [4800, 1], [5200, 0]]),
                pose: t >= 900 && t < 4700 ? 'two' : 'open',
                tilt: kf(t, [[1300, 0], [1700, 22], [3000, 22], [3300, 0], [3600, -14], [4300, -14], [4600, 0]])
            }),
            frame: t >= 700 && t < 4700 ? { rect: A4, held: false } : null,
            scrollOffset: kf(t, [[1500, 0], [3000, 150], [3600, 150], [4300, 90]]),
            scroll: t >= 1200 && t < 4700 ? { x: r.x, y: r.y, v } : null
        };
    }
};
