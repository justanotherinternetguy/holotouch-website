import type { Scene } from '../types';
import { A1 } from '../constants';
import { kf, along, hand, pulseAt, ease } from '../dsl';

// The right hand has the top right corner and the left hand the bottom left. Each corner follows
// its hand only once that hand has pinched, so the window never jumps.
export const resize: Scene = {
    id: 'resize', length: 6200, still: 3700,
    title: 'Resize', pose: 'Second hand pinches too', how: 'While one hand holds a window, pinch with the other and pull them apart or push them together.',
    at(t) {
        const r = along(t, [[0, 390, 226], [800, 530, 150], [2300, 530, 150], [3500, 620, 110], [4100, 620, 110], [4900, 570, 130]]);
        const l = along(t, [[500, 120, 470], [1600, 270, 330], [2300, 270, 330], [3500, 160, 400], [4100, 160, 400], [4900, 210, 370]]);
        const rightPinch = kf(t, [[900, 0], [1100, 1, ease.linear], [5300, 1], [5450, 0, ease.linear]]);
        const leftPinch = kf(t, [[1750, 0], [1950, 1, ease.linear], [5300, 1], [5450, 0, ease.linear]]);
        const rightHolds = t >= 1100, leftHolds = t >= 1950;
        const edges = {
            left: A1.x + (leftHolds ? l.x - 270 : 0),
            top: A1.y + (rightHolds ? r.y - 150 : 0),
            right: A1.x + A1.w + (rightHolds ? r.x - 530 : 0),
            bottom: A1.y + A1.h + (leftHolds ? l.y - 330 : 0)
        };
        const a = { x: edges.left, y: edges.top, w: edges.right - edges.left, h: edges.bottom - edges.top };
        return {
            a,
            right: hand(r, { pinch: rightPinch, pose: rightPinch > 0.5 ? 'index' : 'open' }),
            left: hand(l, { alpha: kf(t, [[500, 0], [800, 1]]), pinch: leftPinch, pose: leftPinch > 0.5 ? 'index' : 'open' }),
            frame: { rect: a, held: t >= 1100 && t < 5450 },
            squeeze: kf(t, [[1100, 0], [1220, 1], [5450, 1], [5560, -0.8], [5800, 0]]),
            resize: t >= 1950 && t < 5450 ? A1 : null,
            pulse: pulseAt(t, 5450, r)
        };
    }
};
