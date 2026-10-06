import type { Rect } from '../motion/ease';

/** The stand-in desktop's size in its own units. */
export const W = 880;
export const H = 560;
export const BAR = 26;

// The line icons the overlay draws (src/holotouch/ui/Icons.js), on a 24-unit grid.
export const ICONS: Record<string, string> = {
    terminal: 'M6 4 L18 4 A3 3 0 0 1 21 7 L21 17 A3 3 0 0 1 18 20 L6 20 A3 3 0 0 1 3 17 L3 7 A3 3 0 0 1 6 4 Z M7 10 L10 12.5 L7 15 M13 15 L17 15',
    globe: 'M12 3 A9 9 0 1 0 12 21 A9 9 0 1 0 12 3 Z M3 12 L21 12 M12 3 C14.8 6 14.8 18 12 21 M12 3 C9.2 6 9.2 18 12 21',
    folder: 'M3 7.5 A2.5 2.5 0 0 1 5.5 5 L9 5 L11 7.5 L18.5 7.5 A2.5 2.5 0 0 1 21 10 L21 16.5 A2.5 2.5 0 0 1 18.5 19 L5.5 19 A2.5 2.5 0 0 1 3 16.5 Z',
    music: 'M9 18 L9 6 L19 4 L19 16 M9 18 A2.5 2.5 0 1 1 4 18 A2.5 2.5 0 1 1 9 18 Z M19 16 A2.5 2.5 0 1 1 14 16 A2.5 2.5 0 1 1 19 16 Z',
    grid: 'M6 4 L9 4 A2 2 0 0 1 11 6 L11 9 A2 2 0 0 1 9 11 L6 11 A2 2 0 0 1 4 9 L4 6 A2 2 0 0 1 6 4 Z M15 4 L18 4 A2 2 0 0 1 20 6 L20 9 A2 2 0 0 1 18 11 L15 11 A2 2 0 0 1 13 9 L13 6 A2 2 0 0 1 15 4 Z M6 13 L9 13 A2 2 0 0 1 11 15 L11 18 A2 2 0 0 1 9 20 L6 20 A2 2 0 0 1 4 18 L4 15 A2 2 0 0 1 6 13 Z M15 13 L18 13 A2 2 0 0 1 20 15 L20 18 A2 2 0 0 1 18 20 L15 20 A2 2 0 0 1 13 18 L13 15 A2 2 0 0 1 15 13 Z',
    window: 'M6 5 L18 5 A3 3 0 0 1 21 8 L21 16 A3 3 0 0 1 18 19 L6 19 A3 3 0 0 1 3 16 L3 8 A3 3 0 0 1 6 5 Z M3 9.5 L21 9.5',
    workspaces: 'M5.5 8 L12.5 8 A2.5 2.5 0 0 1 15 10.5 L15 16.5 A2.5 2.5 0 0 1 12.5 19 L5.5 19 A2.5 2.5 0 0 1 3 16.5 L3 10.5 A2.5 2.5 0 0 1 5.5 8 Z M9 8 L9 7.5 A2.5 2.5 0 0 1 11.5 5 L18.5 5 A2.5 2.5 0 0 1 21 7.5 L21 13.5 A2.5 2.5 0 0 1 18.5 16 L15 16'
};

// The built-in pie menu, clockwise from twelve. Butter launches, lilac opens further, mint acts
// on the window under the hand.
export const PETALS: [icon: string, tone: string, name: string, hint: string][] = [
    ['terminal', 'butter', 'Terminal', 'let go to open'], ['globe', 'butter', 'Browser', 'let go to open'],
    ['folder', 'butter', 'Files', 'let go to open'], ['music', 'lilac', 'Music', 'opens further'],
    ['grid', 'lilac', 'Windows', 'opens further'], ['window', 'mint', 'Window', 'opens further'],
    ['workspaces', 'lilac', 'Workspaces', 'opens further']
];
export const ORBIT = 104;
export const DEAD_ZONE = 26;

// The windows' places: where the browser starts, where it is carried to, what it is resized to,
// where it ends up on the second workspace, and the fixed windows.
export const A0: Rect = { x: 60, y: 64, w: 400, h: 280 };
export const A1: Rect = { x: 200, y: 100, w: 400, h: 280 };
export const A2: Rect = { x: 140, y: 80, w: 500, h: 340 };
export const A4: Rect = { x: 190, y: 90, w: 500, h: 400 };
export const MAX: Rect = { x: 0, y: BAR, w: W, h: H - BAR };
export const TERMINAL: Rect = { x: 560, y: 96, w: 280, h: 196 };
export const FILES: Rect = { x: 572, y: 316, w: 250, h: 180 };
export const MENU = { x: 660, y: 262 };

/** The window switcher's cards: three in a row. */
export const CARD = { w: 220, h: 140, gap: 32, y: 230 };
export function cardSlot(i: number): Rect {
    const total = 3 * CARD.w + 2 * CARD.gap;
    return { x: (W - total) / 2 + i * (CARD.w + CARD.gap), y: CARD.y, w: CARD.w, h: CARD.h };
}

/** The furthest the browser page scrolls, in desk units. */
export const SCROLL_RANGE = 200;
