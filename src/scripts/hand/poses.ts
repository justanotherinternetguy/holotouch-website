// The eleven hand shapes of the control panel's HandFigure, as the paths of five fingers on a
// 96-unit grid: each finger from its knuckle to its tip, then the thumb.
export const FINGERS: Record<string, string> = {
    open: 'M37 52 L33 18 M46 52 L45 12 M55 52 L57 17 M63 54 L68 28 M35 68 L15 50',
    index: 'M37 52 L31 30 L21 38 M46 52 L45 12 M55 52 L57 17 M63 54 L68 28 M35 68 L19 43',
    aim: 'M37 52 L33 18 M46 52 L46 40 M55 52 L55 42 M63 54 L63 45 M35 68 L15 50',
    press: 'M37 52 L33 18 M46 52 L46 40 M55 52 L55 42 M63 54 L63 45 M35 68 L44 55',
    pinky: 'M37 52 L33 18 M46 52 L45 12 M55 52 L57 17 M63 54 L64 38 L47 43 M35 68 L43 49',
    fist: 'M37 52 L37 42 M46 52 L46 40 M55 52 L55 42 M63 54 L63 45 M35 68 L48 60',
    two: 'M37 52 L31 18 M46 52 L49 13 M55 52 L55 42 M63 54 L63 45 M35 68 L47 61',
    claw: 'M37 52 L30 33 M46 52 L45 28 M55 52 L60 32 M63 54 L72 41 M35 68 L19 58',
    peace: 'M37 52 L27 20 M46 52 L53 15 M55 52 L55 42 M63 54 L63 45 M35 68 L47 61',
    y: 'M37 52 L37 42 M46 52 L46 40 M55 52 L55 42 M63 54 L76 32 M35 68 L15 50',
    ily: 'M37 52 L33 18 M46 52 L46 40 M55 52 L55 42 M63 54 L76 32 M35 68 L15 50'
};
export type Pose = keyof typeof FINGERS;

/** Where the fingertips meet, in the poses where they do. */
export const TOUCHES: Record<string, [number, number]> = { index: [20, 40], press: [46, 50], pinky: [45, 45] };

/** Every finger as knuckle, bend and tip (30 numbers a hand), so any pose can become any other. */
function parse(d: string): number[] {
    const flat: number[] = [];
    d.split('M').slice(1).forEach((sub) => {
        const n = sub.replace(/L/g, ' ').trim().split(/\s+/).map(Number);
        if (n.length === 4) n.splice(2, 0, (n[0] + n[2]) / 2, (n[1] + n[3]) / 2);
        flat.push(...n);
    });
    return flat;
}

export const POSES: Record<string, number[]> = {};
for (const name in FINGERS) POSES[name] = parse(FINGERS[name]);
export const POSE_NAMES = Object.keys(POSES);

export function pathOf(p: number[]): string {
    let d = '';
    for (let i = 0; i < 30; i += 6) {
        d += 'M' + p[i].toFixed(2) + ' ' + p[i + 1].toFixed(2) +
            'L' + p[i + 2].toFixed(2) + ' ' + p[i + 3].toFixed(2) +
            'L' + p[i + 4].toFixed(2) + ' ' + p[i + 5].toFixed(2);
    }
    return d;
}
