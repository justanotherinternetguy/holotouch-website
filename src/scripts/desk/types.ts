import type { Rect } from '../motion/ease';
export type { Rect };

export interface HandState {
    x: number; y: number;
    alpha: number;
    pinch: number;
    idle: number;
    pose: string;
    /** Degrees the hand figure is tipped, for the scroll gesture. */
    tilt?: number;
}

export interface Card {
    id: 'browser' | 'files' | 'terminal';
    rect: Rect;
    alpha: number;
    scale?: number;
    aimed?: boolean;
    picked?: boolean;
}

/** Everything on the desktop at one moment. Missing optional fields mean "off". */
export interface DeskState {
    /** The browser window. */
    a: Rect;
    /** How far the terminal is shown, 0 to 1. */
    terminal?: number;
    /** Opacity of the Files window and the browser (windows on another workspace are hidden). */
    files?: number;
    browser?: number;
    /** Which workspace pip is lit. */
    workspace?: 0 | 1;
    right?: HandState | null;
    left?: HandState | null;
    frame?: { rect: Rect; held: boolean } | null;
    squeeze?: number;
    resize?: Rect | null;
    menu?: { open: number; shut: number; aim: number } | null;
    hold?: { x: number; y: number; p: number; done: boolean; pop: number; alpha: number } | null;
    pulse?: { x: number; y: number; p: number } | null;
    chip?: { x: number; y: number; text: string; alpha: number } | null;
    /** A strip at a screen edge filling up: carrying a window to another workspace. */
    edge?: { side: 'left' | 'right'; p: number; done: boolean; alpha: number } | null;
    /** How far the browser's page is scrolled, in desk units. */
    scrollOffset?: number;
    /** The overlay's scroll speed indicator: -1 (up, fast) to 1 (down, fast). */
    scroll?: { x: number; y: number; v: number } | null;
    /** Darkening under the window switcher. */
    dim?: number;
    cards?: Card[] | null;
}

export interface Scene {
    id: string;
    /** Length in milliseconds. */
    length: number;
    /** The moment that says most about it, for when motion is not wanted. */
    still: number;
    title: string;
    pose: string;
    how: string;
    at(t: number): DeskState;
}
