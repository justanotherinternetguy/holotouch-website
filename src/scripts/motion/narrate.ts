// The way narration comes and goes: it blurs and rises in, rests, and blurs away. Timeline time is
// in "vh", so a block that enters over 12 means twelve screen-heights' worth of scroll. With
// motion reduced, only the opacity changes.
import { gsap, calm } from './scroll';

export interface Beat { start: number; length: number; enter?: number; exit?: number; gap?: number; rise?: number; }

const BLUR = 12;

export function enterExit(tl: gsap.core.Timeline, el: Element, beat: Beat) {
    const enter = beat.enter ?? 12, exit = beat.exit ?? 10, gap = beat.gap ?? 2, rise = beat.rise ?? 28;
    const inAt = beat.start + gap;
    const outAt = beat.start + beat.length - gap - exit;
    const from = calm ? { opacity: 0 } : { opacity: 0, y: rise, filter: 'blur(' + BLUR + 'px)' };
    const rest = calm ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' };
    const away = calm ? { opacity: 0 } : { opacity: 0, y: -rise * 0.85, filter: 'blur(' + BLUR + 'px)' };
    gsap.set(el, from);
    tl.to(el, { ...rest, duration: enter, ease: 'power2.out', onComplete: crisp, onReverseComplete: undefined }, inAt);
    tl.to(el, { ...away, duration: exit, ease: 'power2.in', immediateRender: false }, outAt);

    // Resting text is rasterized crisp: a filter of blur(0) still goes through the filter path.
    function crisp(this: gsap.core.Tween) {
        (el as HTMLElement).style.filter = '';
    }
}

/** A block that is shown from the start and leaves: the hero copy. */
export function exitOnly(tl: gsap.core.Timeline, el: Element, outAt: number, exit = 14, rise = 24) {
    const away = calm ? { opacity: 0 } : { opacity: 0, y: -rise, filter: 'blur(' + BLUR + 'px)' };
    tl.to(el, { ...away, duration: exit, ease: 'power2.in' }, outAt);
}
