// Easing, and values that are functions of time: keyframes, positions, rectangles and loops.
export type Ease = (p: number) => number;

export const ease = {
    linear: ((p) => p) as Ease,
    sine: ((p) => 0.5 - Math.cos(Math.PI * p) / 2) as Ease,
    outCubic: ((p) => 1 - Math.pow(1 - p, 3)) as Ease,
    inOutCubic: ((p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)) as Ease,
    outBack: ((p) => { const s = 1.70158; p -= 1; return p * p * ((s + 1) * p + s) + 1; }) as Ease,
    inQuad: ((p) => p * p) as Ease,
    outQuad: ((p) => p * (2 - p)) as Ease
};

export interface Rect { x: number; y: number; w: number; h: number; }
export type Keyframe = [time: number, value: number, easing?: Ease];
export type PointKeyframe = [time: number, x: number, y: number, easing?: Ease];
export type RectKeyframe = [time: number, rect: Rect, easing?: Ease];

/** A value at time t along keyframes [time, value, easing into it]. Holds the ends. */
export function kf(t: number, points: Keyframe[]): number {
    if (t <= points[0][0]) return points[0][1];
    for (let i = 1; i < points.length; i++) {
        if (t <= points[i][0]) {
            const a = points[i - 1], b = points[i];
            return a[1] + (b[1] - a[1]) * (b[2] || ease.sine)((t - a[0]) / (b[0] - a[0]));
        }
    }
    return points[points.length - 1][1];
}

/** The same for a position: [time, x, y, easing]. */
export function along(t: number, points: PointKeyframe[]): { x: number; y: number } {
    return {
        x: kf(t, points.map((p) => [p[0], p[1], p[3]] as Keyframe)),
        y: kf(t, points.map((p) => [p[0], p[2], p[3]] as Keyframe))
    };
}

/** And for a rectangle: [time, rect, easing]. */
export function rectAt(t: number, points: RectKeyframe[]): Rect {
    const pick = (key: keyof Rect) => kf(t, points.map((p) => [p[0], p[1][key], p[2]] as Keyframe));
    return { x: pick('x'), y: pick('y'), w: pick('w'), h: pick('h') };
}

export function lerpRect(a: Rect, b: Rect, p: number): Rect {
    return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, w: a.w + (b.w - a.w) * p, h: a.h + (b.h - a.h) * p };
}

export const clamp01 = (p: number) => Math.min(1, Math.max(0, p));

// A value over a loop, written as the panel writes a SequentialAnimation:
// ['p', ms] waits, ['to', value, ms, easing] moves, ['set', value] jumps.
export type Step = ['p', number] | ['to', number, number, Ease?] | ['set', number];

export function track(start: number, steps: Step[]): (t: number) => number {
    let total = 0;
    steps.forEach((s) => { total += s[0] === 'p' ? s[1] : s[0] === 'to' ? s[2] : 0; });
    return (t) => {
        t %= total;
        let value = start;
        let at = 0;
        for (const s of steps) {
            if (s[0] === 'set') { value = s[1]; continue; }
            const length = s[0] === 'p' ? s[1] : s[2];
            if (t < at + length) {
                return s[0] === 'p' ? value : value + (s[1] - value) * (s[3] || ease.linear)((t - at) / length);
            }
            if (s[0] === 'to') value = s[1];
            at += length;
        }
        return value;
    };
}

/** Swings a value back and forth. */
export function sway(from: number, to: number, time = 1400, rest = 200) {
    return track(from, [['to', to, time, ease.sine], ['p', rest], ['to', from, time, ease.sine], ['p', rest]]);
}
