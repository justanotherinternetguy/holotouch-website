// Wires the page together. The story and the nav are needed at once; the rest of the page's
// scripts load as their sections come near.
import { ScrollTrigger, refreshWhenReady } from './motion/scroll';
import { reveal } from './motion/reveal';
import { initStory } from './story/controller';

const story = document.querySelector<HTMLElement>('[data-story]');
if (story) initStory(story);

const nav = document.querySelector<HTMLElement>('[data-nav]');
if (nav) ScrollTrigger.create({ start: 8, end: 'max', toggleClass: { targets: nav, className: 'is-scrolled' } });

reveal();

// Load a module when an element comes within 800px of the viewport.
function near(selector: string, load: () => Promise<unknown>) {
    const target = document.querySelector(selector);
    if (!target) return;
    const watcher = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        watcher.disconnect();
        load();
    }, { rootMargin: '800px 0px' });
    watcher.observe(target);
}
near('#why', () => import('./page').then((m) => m.initPage()));
near('#how', () => import('./pipeline/controller').then((m) => m.initPipeline(document.querySelector<HTMLElement>('[data-pipe]'))));

refreshWhenReady();
