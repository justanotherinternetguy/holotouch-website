// The gesture story. One timeline, measured in screen-heights of scroll, carries everything on
// the stage: the hero copy leaving, the desktop growing into place, each chapter's narration
// coming and going, and the desktop itself, drawn from the playhead so it can never lag the text.
import { gsap, ScrollTrigger, calm, narrow, unit } from '../motion/scroll';
import { enterExit, exitOnly } from '../motion/narrate';
import { createDeskRenderer } from '../desk/renderer';
import { WIDE, NARROW, layout, momentAt, type Span } from './chapters';

export function initStory(root: HTMLElement) {
    const deskRoot = root.querySelector<HTMLElement>('[data-desk]')!;
    const frame = root.querySelector<HTMLElement>('[data-desk-frame]')!;
    const slot = root.querySelector<HTMLElement>('[data-hero-slot]')!;
    const hero = root.querySelector<HTMLElement>('[data-hero]')!;
    const hint = root.querySelector<HTMLElement>('[data-hint]');
    const hands = root.querySelector<HTMLElement>('[data-hands]');
    const blocks = new Map(Array.from(root.querySelectorAll<HTMLElement>('[data-chapter]')).map((b) => [b.dataset.chapter!, b]));

    const renderer = createDeskRenderer(deskRoot, hands);
    new ResizeObserver((entries) => renderer.fit(entries[0].contentRect.width)).observe(deskRoot);
    renderer.fit(deskRoot.clientWidth);

    let spans: Span[] = [];
    let total = 0;
    let drawn = { scene: '', t: -1 };
    function drawAt(time: number) {
        const { scene, t } = momentAt(spans, time);
        if (scene.id === drawn.scene && Math.abs(t - drawn.t) < 0.5) return;
        drawn = { scene: scene.id, t };
        renderer.draw(scene.at(t));
    }

    // Where the desktop sits under the headline, relative to its place beside the narration.
    const flip = { x: 0, y: 0, scale: 1 };
    function measure() {
        root.style.height = Math.round((total + 100) * unit()) + 'px';
        const was = frame.style.transform;
        frame.style.transform = 'none';
        const s = slot.getBoundingClientRect(), d = frame.getBoundingClientRect();
        frame.style.transform = was;
        if (!d.width || !d.height) return;
        const scale = Math.min(s.width / d.width, s.height / d.height, 1.6);
        flip.scale = scale;
        flip.x = s.left + (s.width - d.width * scale) / 2 - d.left;
        flip.y = s.top + (s.height - d.height * scale) / 2 - d.top;
    }

    let tl: gsap.core.Timeline | null = null;
    let trigger: ScrollTrigger | null = null;

    function build() {
        const wide = !narrow();
        const pace = wide ? WIDE : NARROW;
        ({ spans, total } = layout(pace));
        tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

        // The hint goes first, then the hero copy, and the headline stops taking clicks.
        if (hint) tl.to(hint, { opacity: 0, duration: 8 }, 0);
        const heroOut = pace.heroVh * 0.38;
        exitOnly(tl, hero, 0, heroOut, wide ? 24 : 14);
        tl.set(hero, { pointerEvents: 'none' }, heroOut);

        // The desktop grows from under the headline into its place, and sharpens as it settles.
        tl.fromTo(frame,
            { x: () => flip.x, y: () => flip.y, scale: () => flip.scale },
            { x: 0, y: 0, scale: 1, duration: pace.heroVh * 0.78, ease: 'power2.inOut' }, 0);
        if (!calm) {
            tl.fromTo(frame, { filter: 'blur(6px)' }, {
                filter: 'blur(0px)', duration: pace.heroVh * 0.55, ease: 'power2.out',
                onComplete: () => { frame.style.filter = ''; }
            }, 0);
        }

        spans.forEach((span) => {
            const block = blocks.get(span.chapter.scene.id);
            if (block) enterExit(tl!, block, { start: span.start, length: span.end - span.start, rise: wide ? 28 : 16 });
        });
        tl.set({}, {}, total);
        tl.eventCallback('onUpdate', () => drawAt(tl!.time()));

        trigger = ScrollTrigger.create({
            trigger: root, start: 'top top', end: 'bottom bottom',
            scrub: calm ? true : 0.6, animation: tl, invalidateOnRefresh: true,
            onRefreshInit: measure
        });
        measure();
        drawn = { scene: '', t: -1 };
        drawAt(tl.time());
    }

    function rebuild() {
        trigger?.kill();
        tl?.kill();
        gsap.set([frame, hero, hint, ...blocks.values()].filter(Boolean), { clearProps: 'all' });
        build();
        ScrollTrigger.refresh();
    }

    build();
    window.matchMedia('(max-width: 760px)').addEventListener('change', rebuild);
}
