// The 21 landmarks MediaPipe reports for a hand, placed on the illustrated hand's 96-unit grid
// from its 30-number pose (five fingers as knuckle, bend, tip; the thumb last).
// Order: 0 wrist; 1-4 thumb CMC, MCP, IP, tip; then index, middle, ring, pinky as MCP, PIP, DIP, tip.
export type Point = [number, number];

const WRIST: Point = [49, 86];
const THUMB_CMC: Point = [39, 76];

export function landmarksOf(p: number[]): Point[] {
    const pts: Point[] = [WRIST];
    const finger = (i: number): Point[] => {
        const kx = p[i], ky = p[i + 1], bx = p[i + 2], by = p[i + 3], tx = p[i + 4], ty = p[i + 5];
        return [[kx, ky], [bx, by], [(bx + tx) / 2, (by + ty) / 2], [tx, ty]];
    };
    const thumb = finger(24);
    pts.push(THUMB_CMC, thumb[0], thumb[1], thumb[3]);
    for (let f = 0; f < 4; f++) pts.push(...finger(f * 6));
    return pts;
}

/** The bones between landmarks, as MediaPipe draws them. */
export const BONES: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [9, 10], [10, 11], [11, 12],
    [13, 14], [14, 15], [15, 16],
    [0, 17], [17, 18], [18, 19], [19, 20],
    [5, 9], [9, 13], [13, 17]
];
