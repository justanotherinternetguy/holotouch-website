import { createDeskRenderer } from './desk/renderer';
import { autoplay } from './desk/autoplay';

const root = document.querySelector<HTMLElement>('[data-desk]')!;
const renderer = createDeskRenderer(root, document.getElementById('now-hands'));
new ResizeObserver((entries) => renderer.fit(entries[0].contentRect.width)).observe(root);
renderer.fit(root.clientWidth);
autoplay(renderer, {
    title: document.getElementById('now-title'), pose: document.getElementById('now-pose'),
    how: document.getElementById('now-how'), time: document.getElementById('now-time'),
    tabs: Array.from(document.querySelectorAll<HTMLElement>('[data-scene]')),
    toggle: document.getElementById('desk-toggle'),
    scrub: document.getElementById('scrub') as HTMLInputElement
});
