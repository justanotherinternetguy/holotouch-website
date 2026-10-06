import { describe, it, expect } from 'vitest';
import { SCENES } from './index';
import type { DeskState, HandState } from '../types';

// Each scene must end exactly where the next begins, or the desktop jumps while the reader rests.
const near = (a: number, b: number, what: string) => expect(Math.abs(a - b), what).toBeLessThanOrEqual(0.5);

function sameHand(a: HandState | null | undefined, b: HandState | null | undefined, what: string) {
    const alphaA = a?.alpha ?? 0, alphaB = b?.alpha ?? 0;
    near(alphaA, alphaB, what + ' alpha');
    if (alphaA > 0.01 && a && b) {
        near(a.x, b.x, what + ' x');
        near(a.y, b.y, what + ' y');
    }
}

function sameDesk(a: DeskState, b: DeskState, what: string) {
    (['x', 'y', 'w', 'h'] as const).forEach((k) => near(a.a[k], b.a[k], what + ' browser ' + k));
    near(a.terminal ?? 0, b.terminal ?? 0, what + ' terminal');
    near(a.files ?? 1, b.files ?? 1, what + ' files');
    near(a.browser ?? 1, b.browser ?? 1, what + ' browser opacity');
    near(a.workspace ?? 0, b.workspace ?? 0, what + ' workspace');
    near(a.scrollOffset ?? 0, b.scrollOffset ?? 0, what + ' scroll offset');
    sameHand(a.right, b.right, what + ' right hand');
    sameHand(a.left, b.left, what + ' left hand');
}

describe('scenes chain', () => {
    for (let i = 0; i < SCENES.length - 1; i++) {
        const from = SCENES[i], to = SCENES[i + 1];
        it(`${from.id} ends where ${to.id} begins`, () => {
            sameDesk(from.at(from.length), to.at(0), `${from.id} → ${to.id}`);
        });
    }

    it('every scene is defined at every moment', () => {
        SCENES.forEach((scene) => {
            for (let t = 0; t <= scene.length; t += 50) {
                const s = scene.at(t);
                expect(Number.isFinite(s.a.x + s.a.y + s.a.w + s.a.h), `${scene.id} at ${t}`).toBe(true);
            }
        });
    });

    it('ends on a quiet frame', () => {
        const last = SCENES[SCENES.length - 1];
        const s = last.at(last.length);
        expect(s.right?.alpha ?? 0).toBeLessThan(0.01);
        expect(s.left?.alpha ?? 0).toBeLessThan(0.01);
    });
});
