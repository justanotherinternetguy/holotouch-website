// The gesture story: a hero, then one chapter a scene. Times are in "vh" of scroll. A chapter
// rests on its scene's first frame while the narration comes in, plays the scene as the reader
// scrolls, and rests on its last frame while the narration leaves.
import { SCENES } from '../desk/scenes';
import type { Scene } from '../desk/types';

export interface Chapter {
    scene: Scene;
    /** Where the narration sits on wide screens. */
    side: 'left' | 'right';
}

export const CHAPTERS: Chapter[] = SCENES.map((scene) => ({ scene, side: 'left' }));

export interface Pace {
    /** Scroll (vh) that stands for one millisecond of a scene. */
    msPerVh: number;
    heroVh: number;
    enterHold: number;
    exitHold: number;
}
export const WIDE: Pace = { msPerVh: 55, heroVh: 90, enterHold: 20, exitHold: 10 };
export const NARROW: Pace = { msPerVh: 85, heroVh: 60, enterHold: 12, exitHold: 6 };

export interface Span {
    chapter: Chapter;
    /** Where the chapter starts and ends on the timeline. */
    start: number; end: number;
    /** Where the scene plays, between the two holds. */
    actionStart: number; actionEnd: number;
}

/** Lay the chapters out along the timeline. */
export function layout(pace: Pace): { spans: Span[]; total: number } {
    let at = pace.heroVh;
    const spans = CHAPTERS.map((chapter) => {
        const action = chapter.scene.length / pace.msPerVh;
        const span: Span = {
            chapter, start: at,
            actionStart: at + pace.enterHold,
            actionEnd: at + pace.enterHold + action,
            end: at + pace.enterHold + action + pace.exitHold
        };
        at = span.end;
        return span;
    });
    return { spans, total: at };
}

/** The scene and the moment within it that a timeline time stands for. */
export function momentAt(spans: Span[], time: number): { scene: Scene; t: number } {
    let span = spans[0];
    for (const s of spans) {
        if (time >= s.start) span = s;
    }
    const p = Math.min(1, Math.max(0, (time - span.actionStart) / (span.actionEnd - span.actionStart)));
    return { scene: span.chapter.scene, t: p * span.chapter.scene.length };
}
