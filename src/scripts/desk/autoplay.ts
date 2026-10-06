// Plays the scenes on a loop, the way the old hero did: for authoring on the dev page.
import { ticker } from '../motion/ticker';
import { SCENES } from './scenes';
import type { DeskRenderer } from './renderer';

export interface AutoplayControls {
    title?: HTMLElement | null;
    pose?: HTMLElement | null;
    how?: HTMLElement | null;
    time?: HTMLElement | null;
    tabs?: HTMLElement[];
    toggle?: HTMLElement | null;
    scrub?: HTMLInputElement | null;
}

export function autoplay(renderer: DeskRenderer, controls: AutoplayControls = {}) {
    let index = 0, time = 0, last: number | null = null, playing = false;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function caption() {
        const scene = SCENES[index];
        if (controls.title) controls.title.textContent = scene.title;
        if (controls.pose) controls.pose.textContent = scene.pose;
        if (controls.how) controls.how.textContent = scene.how;
        controls.tabs?.forEach((tab) => tab.setAttribute('aria-pressed', String(tab.dataset.scene === scene.id)));
        if (controls.scrub) controls.scrub.max = String(scene.length);
    }
    function show() {
        renderer.draw(SCENES[index].at(time));
        if (controls.time) controls.time.textContent = Math.round(time) + ' / ' + SCENES[index].length + ' ms';
        if (controls.scrub && document.activeElement !== controls.scrub) controls.scrub.value = String(Math.round(time));
    }
    function tick(now: number) {
        const step = last === null ? 0 : Math.min(100, now - last);
        last = now;
        time += step;
        if (time >= SCENES[index].length) {
            time -= SCENES[index].length;
            index = (index + 1) % SCENES.length;
            caption();
        }
        show();
    }
    function run() {
        last = null;
        if (playing) ticker.add(tick);
        else ticker.remove(tick);
    }
    function setPlaying(on: boolean) {
        playing = on;
        if (controls.toggle) {
            controls.toggle.setAttribute('aria-pressed', String(on));
            const label = controls.toggle.querySelector('span');
            if (label) label.textContent = on ? 'Pause' : 'Play';
        }
        run();
    }
    function go(id: string, t: number) {
        index = Math.max(0, SCENES.findIndex((scene) => scene.id === id));
        time = t;
        caption();
        show();
    }

    controls.tabs?.forEach((tab) => {
        tab.addEventListener('click', () => {
            // Paused, a scene is shown at the moment that says most about it.
            const scene = SCENES.find((s) => s.id === tab.dataset.scene) || SCENES[0];
            go(scene.id, playing ? 0 : scene.still);
        });
    });
    controls.toggle?.addEventListener('click', () => setPlaying(!playing));
    controls.scrub?.addEventListener('input', () => {
        setPlaying(false);
        time = Number(controls.scrub!.value);
        show();
    });

    if (calm) time = SCENES[0].still;
    caption();
    show();
    setPlaying(!calm);

    return { go, setPlaying };
}
