// Sections below the story come in as they are scrolled to: a soft rise and, unless motion is
// reduced, a blur that clears. Each element is revealed once.
import { gsap, ScrollTrigger, calm } from './scroll';

export function reveal(selector = '[data-reveal]') {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (!nodes.length) return;
    if (calm) {
        nodes.forEach((node) => node.classList.add('is-shown'));
        return;
    }
    nodes.forEach((node) => {
        const children = node.dataset.reveal === 'children' ? Array.from(node.children) : [node];
        gsap.set(children, { opacity: 0, y: 26, filter: 'blur(8px)' });
        ScrollTrigger.create({
            trigger: node,
            start: 'top 88%',
            once: true,
            onEnter: () => {
                gsap.to(children, {
                    opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', stagger: 0.08,
                    clearProps: 'filter,transform',
                    onComplete: () => node.classList.add('is-shown')
                });
            }
        });
    });
}
