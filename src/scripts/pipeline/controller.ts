// How it works, scrubbed: a hand is drawn into the camera's view, its 21 landmarks are found,
// the rules measure the thumb against the index finger and name the pose, and a window answers.
import { gsap, ScrollTrigger, calm, narrow, unit } from '../motion/scroll';
import { enterExit } from '../motion/narrate';
import { Hand } from '../hand/hand';
import { landmarksOf } from '../hand/landmarks';

const PALM = 36;

export function initPipeline(root: HTMLElement | null) {
    if (!root) return;
    const q = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
    const cam = q('[data-cam]');
    const handSlot = q('[data-pipe-hand]');
    const measure = q<SVGSVGElement>('[data-measure]');
    const line = q<SVGLineElement>('[data-measure-line]');
    const label = q<SVGTextElement>('[data-measure-text]');
    const value = q('[data-measure-value]');
    const lines = Array.from(root.querySelectorAll<HTMLElement>('[data-line]'));
    const verdict = q('[data-verdict]');
    const win = q('[data-pipe-win]');
    const frame = q('[data-pipe-frame]');
    const pulse = q('[data-pipe-pulse]');
    const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-step]'));

    const hand = Hand.figure({ side: 'right', landmarks: true, pose: 'open' });
    handSlot.appendChild(hand.svg);

    function updateMeasure() {
        const lm = landmarksOf(hand.points);
        const [tx, ty] = lm[4], [ix, iy] = lm[8];
        const d = Math.hypot(ix - tx, iy - ty) / PALM;
        line.setAttribute('x1', tx.toFixed(1)); line.setAttribute('y1', ty.toFixed(1));
        line.setAttribute('x2', ix.toFixed(1)); line.setAttribute('y2', iy.toFixed(1));
        const text = d.toFixed(2);
        label.textContent = text + ' palm';
        value.textContent = text;
    }

    let total = 0;
    let tl: gsap.core.Timeline | null = null;
    let trigger: ScrollTrigger | null = null;

    function build() {
        const STEP = narrow() ? 55 : 80;
        total = 4 * STEP;
        tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

        // 1. The camera frame comes on and the hand is drawn into view.
        tl.fromTo(cam, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 20, ease: 'power2.out' }, 0);
        const drawn = { p: calm ? 1 : 0 };
        hand.reveal(drawn.p);
        if (!calm) tl.to(drawn, { p: 1, duration: 40, onUpdate: () => hand.reveal(drawn.p) }, 10);

        // 2. The landmarks pop in, in the tracker's order, then the bones between them.
        const marks = { dots: calm ? 1 : 0, bones: calm ? 1 : 0 };
        const showMarks = () => hand.showLandmarks(marks.dots, marks.bones);
        showMarks();
        if (!calm) {
            tl.to(marks, { dots: 1, duration: 45, onUpdate: showMarks }, STEP + 5);
            tl.to(marks, { bones: 1, duration: 20, onUpdate: showMarks }, STEP + 40);
        }
        [0, 1].forEach((i) => tl!.fromTo(lines[i], { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 8, ease: 'power2.out' }, STEP + 24 + 12 * i));

        // 3. The hand closes to a pinch; the thumb is measured against the index finger.
        const blend = { b: 0 };
        const applyBlend = () => { hand.blend('open', 'index', blend.b); updateMeasure(); };
        updateMeasure();
        tl.to(blend, { b: 1, duration: 30, onUpdate: applyBlend }, 2 * STEP + 12);
        tl.fromTo(measure, { opacity: 0 }, { opacity: 1, duration: 8 }, 2 * STEP + 4);
        tl.to(measure, { opacity: 0, duration: 8 }, 3 * STEP - 12);
        [2, 3].forEach((i) => tl!.fromTo(lines[i], { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 8, ease: 'power2.out' }, 2 * STEP + 6 + 12 * (i - 2)));
        tl.fromTo(verdict, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 10, ease: 'back.out(1.7)' }, 2 * STEP + 46);

        // 4. The window is held and carried with the hand, then let go.
        tl.fromTo(frame, { opacity: 0 }, { opacity: 1, duration: 6 }, 3 * STEP + 6);
        tl.to([handSlot, win], { x: 44, duration: 36, ease: 'power1.inOut' }, 3 * STEP + 14);
        tl.to(frame, { opacity: 0, duration: 4 }, 3 * STEP + 54);
        tl.fromTo(pulse, { opacity: 1, scale: 0.6 }, { opacity: 0, scale: 1.7, duration: 10, ease: 'power2.out', immediateRender: false }, 3 * STEP + 54);

        steps.forEach((step, i) => enterExit(tl!, step, { start: i * STEP, length: STEP, rise: narrow() ? 16 : 24 }));
        tl.set({}, {}, total);

        trigger = ScrollTrigger.create({
            trigger: root, start: 'top top', end: 'bottom bottom',
            scrub: calm ? true : 0.6, animation: tl, invalidateOnRefresh: true,
            onRefreshInit: () => { root!.style.height = Math.round((total + 100) * unit()) + 'px'; }
        });
        root!.style.height = Math.round((total + 100) * unit()) + 'px';
    }

    build();
    window.matchMedia('(max-width: 760px)').addEventListener('change', () => {
        trigger?.kill();
        tl?.kill();
        gsap.set([cam, measure, verdict, frame, pulse, handSlot, win, ...lines, ...steps], { clearProps: 'all' });
        build();
        ScrollTrigger.refresh();
    });
}
