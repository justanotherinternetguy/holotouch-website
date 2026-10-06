// GSAP's ScrollTrigger, set up once for the page.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

/** Motion has been asked to be reduced: no blur, no flourishes, and nothing that plays by itself. */
export const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Narrow screens stack the narration over the stage and scroll a shorter way. */
export const narrow = () => window.matchMedia('(max-width: 760px)').matches;

/** One "vh" of story in pixels: a hundredth of the viewport, clamped so huge and tiny screens scroll sensibly. */
export const unit = () => Math.min(960, Math.max(560, window.innerHeight)) / 100;

let refreshQueued = false;
/** Refresh once fonts have settled, then again if a hash points into the page. */
export function refreshWhenReady() {
    if (refreshQueued) return;
    refreshQueued = true;
    document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
        if (location.hash) {
            const target = document.querySelector(location.hash);
            target?.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' });
        }
    });
}

export { gsap, ScrollTrigger };
