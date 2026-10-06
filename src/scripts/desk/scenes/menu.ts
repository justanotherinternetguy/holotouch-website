import type { Scene } from '../types';
import { A2, MENU, PETALS, DEAD_ZONE } from '../constants';
import { kf, along, hand, pulseAt, ease } from '../dsl';

export const menu: Scene = {
    id: 'menu', length: 6000, still: 4500,
    title: 'Pie menu', pose: 'Thumb + pinky pinch', how: 'Pinch thumb and pinky, move toward an item and let go to pick it: apps, windows, music.',
    at(t) {
        const r = along(t, [[0, 570, 130], [900, MENU.x, MENU.y], [1500, MENU.x, MENU.y], [2300, 718, 276], [2700, 718, 276],
                            [3300, 706, 224], [3600, 706, 224], [4200, 664, 202]]);
        const pinch = kf(t, [[1300, 0], [1500, 1, ease.linear], [4900, 1], [5050, 0, ease.linear]]);
        let aim = -1;
        if (t >= 4900) {
            aim = 0;
        } else if (t >= 1500 && Math.hypot(r.x - MENU.x, r.y - MENU.y) > DEAD_ZONE) {
            const turn = Math.atan2(r.x - MENU.x, MENU.y - r.y) * 180 / Math.PI;
            aim = Math.round(((turn + 360) % 360) / (360 / PETALS.length)) % PETALS.length;
        }
        return {
            a: A2,
            terminal: kf(t, [[5000, 0], [5380, 1, ease.outBack]]),
            right: hand(r, { pinch, pose: pinch > 0.5 ? 'pinky' : 'open' }),
            left: hand(along(t, [[0, 210, 370], [1200, 150, 440]]), { idle: kf(t, [[1800, 0], [2200, 1]]) }),
            frame: t < 600 ? { rect: A2, held: false } : null,
            menu: t >= 1500 && t < 5300 ? { open: t - 1500, shut: t - 4900, aim } : null,
            pulse: pulseAt(t, 4900, r)
        };
    }
};
