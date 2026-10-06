// Draws one moment of the desktop: HoloTouch's overlay (ring cursors, frames, the pie menu, the
// hold ring and the rest) over the stand-in windows. It only writes transforms, opacity, classes
// and text, so it is safe to call once a frame from any controller.
import { ease } from '../motion/ease';
import { Hand } from '../hand/hand';
import type { DeskState, HandState, Rect } from './types';
import { W, H, BAR, ICONS, PETALS, ORBIT, MENU, TERMINAL, FILES, SCROLL_RANGE } from './constants';

export interface DeskRenderer {
    draw(state: DeskState): void;
    /** Scale the 880-unit desktop to `width` pixels. */
    fit(width: number): void;
    figures: { left: Hand; right: Hand };
}

function div(className: string, parent?: Element | null, html?: string): HTMLDivElement {
    const node = document.createElement('div');
    node.className = className;
    if (html) node.innerHTML = html;
    if (parent) parent.appendChild(node);
    return node;
}
const px = (n: number) => n.toFixed(2) + 'px';
function box(node: HTMLElement, rect: Rect, grow = 0) {
    node.style.transform = 'translate(' + px(rect.x - grow) + ',' + px(rect.y - grow) + ')';
    node.style.width = px(rect.w + 2 * grow);
    node.style.height = px(rect.h + 2 * grow);
}
const icon = (name: string) => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + ICONS[name] + '"/></svg>';

function cursor(overlay: Element, side: 'l' | 'r') {
    const node = div('cur cur--' + side, overlay,
        '<div class="cur__ring"><div class="cur__dot"></div></div><div class="cur__tag">' + (side === 'l' ? 'L' : 'R') + '</div>');
    return (s: HandState | null | undefined) => {
        if (!s || s.alpha <= 0) { node.style.opacity = '0'; return; }
        node.style.transform = 'translate(' + px(s.x) + ',' + px(s.y) + ')';
        node.style.opacity = String(s.alpha * (1 - 0.3 * s.idle));
        node.style.setProperty('--d', px(56 - 8 * s.pinch - 12 * s.idle));
        node.style.setProperty('--dot', px(26 * s.pinch));
        node.classList.toggle('is-pinching', s.pinch > 0.02);
    };
}

function pieMenu(overlay: Element, at: { x: number; y: number }) {
    const half = Math.PI / PETALS.length;
    const sin = Math.sin(half), cos = Math.cos(half);
    const inner = 46, outer = 156;
    const wedge = 'M' + -inner * sin + ' ' + -inner * cos + ' L' + -outer * sin + ' ' + -outer * cos +
        ' A' + outer + ' ' + outer + ' 0 0 1 ' + outer * sin + ' ' + -outer * cos +
        ' L' + inner * sin + ' ' + -inner * cos + ' A' + inner + ' ' + inner + ' 0 0 0 ' + -inner * sin + ' ' + -inner * cos + ' Z';
    const arc = 'M' + -ORBIT * sin + ' ' + -ORBIT * cos + ' A' + ORBIT + ' ' + ORBIT + ' 0 0 1 ' + ORBIT * sin + ' ' + -ORBIT * cos;
    const node = div('pie', overlay,
        '<svg class="pie__lines" viewBox="-170 -170 340 340" aria-hidden="true">' +
        '<circle class="pie__orbit-ink" r="' + ORBIT + '"/><circle class="pie__orbit" r="' + ORBIT + '"/>' +
        '<g class="pie__aim"><path class="pie__wedge-ink" d="' + wedge + '"/><path class="pie__wedge" d="' + wedge + '"/>' +
        '<path class="pie__arc-key" d="' + arc + '"/><path class="pie__arc" d="' + arc + '"/></g></svg>');
    node.style.transform = 'translate(' + at.x + 'px,' + at.y + 'px)';
    const lines = node.querySelector<HTMLElement>('.pie__lines')!;
    const aimed = node.querySelector<HTMLElement>('.pie__aim')!;
    const petals = PETALS.map((petal) =>
        div('petal', node, '<div class="petal__face petal__face--' + petal[1] + '"><div class="petal__disc">' + icon(petal[0]) + '</div></div>'));
    const seed = div('pie__seed', node, '<div class="pie__word"></div><div class="pie__hint"></div>');
    const word = seed.querySelector('.pie__word')!, hint = seed.querySelector('.pie__hint')!;
    let shownAim: number | null = null;

    return (m: DeskState['menu']) => {
        node.style.display = m ? '' : 'none';
        if (!m) return;
        const shutting = m.shut >= 0;
        // The chosen petal pulses once, then every petal falls back into the seed.
        const wilt = shutting ? ease.inQuad(Math.min(1, Math.max(0, (m.shut - 120) / 160))) : 0;
        petals.forEach((petal, i) => {
            const bloom = ease.outBack(Math.min(1, Math.max(0, (m.open - 40 * i) / 320))) * (1 - wilt);
            const turn = i * 2 * half;
            const reach = ORBIT * bloom;
            petal.style.transform = 'translate(' + px(reach * Math.sin(turn)) + ',' + px(-reach * Math.cos(turn)) + ') scale(' + (0.3 + 0.7 * bloom) + ')';
            petal.style.opacity = String(Math.min(1, m.open / 60) * (1 - wilt));
            petal.classList.toggle('is-aimed', i === m.aim);
            petal.classList.toggle('is-picked', shutting && i === m.aim && m.shut < 120);
        });
        const grown = ease.outBack(Math.min(1, m.open / 220));
        seed.style.transform = 'scale(' + grown + ')';
        seed.style.opacity = String(shutting ? 1 - Math.min(1, Math.max(0, (m.shut - 200) / 160)) : 1);
        lines.style.opacity = String(Math.min(1, m.open / 200) * (1 - wilt));
        aimed.style.opacity = m.aim < 0 ? '0' : '1';
        if (m.aim !== shownAim) {
            shownAim = m.aim;
            if (m.aim >= 0) aimed.style.transform = 'rotate(' + m.aim * 360 / PETALS.length + 'deg)';
            word.textContent = m.aim < 0 ? 'Menu' : PETALS[m.aim][2];
            hint.textContent = m.aim < 0 ? 'move to aim' : PETALS[m.aim][3];
        }
    };
}

const CARD_NAMES = { browser: 'Browser', files: 'Files', terminal: 'Terminal' };

/**
 * Build the overlay inside `root` (the `.desk` element holding `.desk__inner` and its windows).
 * The two hand figures are appended to `handsSlot` if given; they show what each hand is doing.
 */
export function createDeskRenderer(root: HTMLElement, handsSlot?: HTMLElement | null): DeskRenderer {
    const desk = root.querySelector<HTMLElement>('.desk__inner')!;
    const browser = desk.querySelector<HTMLElement>('[data-window="browser"]')!;
    const terminal = desk.querySelector<HTMLElement>('[data-window="terminal"]')!;
    const files = desk.querySelector<HTMLElement>('[data-window="files"]')!;
    const page = browser.querySelector<HTMLElement>('.win__page')!;
    const thumb = browser.querySelector<HTMLElement>('.win__thumb');
    const pips = Array.from(desk.querySelectorAll<HTMLElement>('.desk__pips i'));
    const overlay = div('ov', desk);

    const dim = div('ov-dim', overlay);
    const edge = div('ov-edge', overlay, '<div class="ov-edge__fill"></div>');
    const edgeFill = edge.firstElementChild as HTMLElement;
    const ghost = div('ov-ghost', overlay);
    const frame = div('ov-frame', overlay, '<i></i><i></i><i></i><i></i>');
    const gripRight = div('ov-grip ov-grip--r', overlay), gripLeft = div('ov-grip ov-grip--l', overlay);
    const size = div('ov-chip ov-size', overlay);
    const cards = (['browser', 'files', 'terminal'] as const).map((id) =>
        div('ov-card ov-card--' + id, overlay, '<div class="ov-card__bar"></div><div class="ov-card__body"></div><div class="ov-chip ov-card__name">' + CARD_NAMES[id] + '</div>'));
    const drawMenu = pieMenu(overlay, MENU);
    const hold = div('ov-hold', overlay,
        '<svg viewBox="-60 -60 120 120" aria-hidden="true"><circle class="ov-hold__ink" r="46"/><circle class="ov-hold__track" r="46"/>' +
        '<circle class="ov-hold__arc" r="46" pathLength="100" transform="rotate(-90)"/></svg><div class="ov-chip">Close</div>');
    const holdArc = hold.querySelector('.ov-hold__arc')!;
    const pulse = div('ov-pulse', overlay);
    const chip = div('ov-chip ov-label', overlay);
    const scroll = div('ov-scroll', overlay, '<div class="ov-scroll__fill"></div><i class="ov-scroll__arrow"></i>');
    const scrollFill = scroll.firstElementChild as HTMLElement;
    const drawLeft = cursor(overlay, 'l'), drawRight = cursor(overlay, 'r');

    const figures = { left: Hand.figure({ side: 'left' }), right: Hand.figure({ side: 'right' }) };
    if (handsSlot) {
        handsSlot.appendChild(figures.left.svg);
        handsSlot.appendChild(figures.right.svg);
    }

    box(files, FILES);

    function drawHandFigure(figure: Hand, s: HandState | null | undefined) {
        figure.setPose(s ? s.pose : 'open');
        figure.svg.classList.toggle('is-away', !s || s.alpha < 0.5);
        const tilt = s?.tilt || 0;
        figure.g.setAttribute('transform', tilt ? 'rotate(' + tilt + ' 48 84)' : '');
    }

    function draw(s: DeskState) {
        box(browser, s.a);
        browser.style.opacity = String(s.browser ?? 1);
        files.style.opacity = String(s.files ?? 1);
        const shown = s.terminal || 0;
        terminal.style.opacity = String(Math.min(1, shown * 1.4));
        box(terminal, TERMINAL);
        terminal.style.transform += ' scale(' + (0.86 + 0.14 * shown) + ')';
        pips.forEach((pip, i) => pip.classList.toggle('on', i === (s.workspace ?? 0)));

        const offset = s.scrollOffset || 0;
        page.style.transform = 'translateY(' + px(-offset) + ')';
        if (thumb) {
            const track = s.a.h - BAR - 36 - 8;
            thumb.style.transform = 'translateY(' + px((offset / SCROLL_RANGE) * Math.max(0, track - 40)) + ')';
        }

        dim.style.opacity = String(s.dim || 0);

        frame.classList.toggle('is-on', !!s.frame);
        if (s.frame) {
            frame.classList.toggle('is-held', s.frame.held);
            box(frame, s.frame.rect, 5 - 3 * (s.squeeze || 0));
        }
        const sizing = s.resize;
        [ghost, gripRight, gripLeft, size].forEach((node) => node.classList.toggle('is-on', !!sizing));
        if (sizing) {
            box(ghost, sizing);
            gripRight.style.transform = 'translate(' + px(s.a.x + s.a.w) + ',' + px(s.a.y) + ')';
            gripLeft.style.transform = 'translate(' + px(s.a.x) + ',' + px(s.a.y + s.a.h) + ')';
            size.style.transform = 'translate(' + px(s.a.x + s.a.w / 2) + ',' + px(s.a.y + s.a.h + 4) + ') translate(-50%, -50%)';
            size.textContent = Math.round(s.a.w * 1.6) + ' × ' + Math.round(s.a.h * 1.6);
        }

        edge.style.opacity = String(s.edge ? s.edge.alpha : 0);
        if (s.edge) {
            edge.style.transform = 'translate(' + px(s.edge.side === 'right' ? W - 20 : 0) + ',' + px(BAR) + ')';
            edge.classList.toggle('is-done', s.edge.done);
            const h = (H - BAR) * s.edge.p;
            edgeFill.style.transform = 'translateY(' + px((H - BAR - h) / 2) + ')';
            edgeFill.style.height = px(h);
        }

        cards.forEach((node, i) => {
            const card = s.cards ? s.cards[i] : null;
            node.style.display = card && card.alpha > 0 ? '' : 'none';
            if (!card) return;
            box(node, card.rect);
            node.style.opacity = String(card.alpha);
            node.classList.toggle('is-aimed', !!card.aimed);
            node.classList.toggle('is-picked', !!card.picked);
        });

        drawMenu(s.menu);

        hold.style.display = s.hold ? '' : 'none';
        if (s.hold) {
            hold.style.transform = 'translate(' + px(s.hold.x) + ',' + px(s.hold.y) + ') scale(' + s.hold.pop + ')';
            hold.style.opacity = String(s.hold.alpha);
            hold.classList.toggle('is-done', s.hold.done);
            holdArc.setAttribute('stroke-dasharray', 100 * s.hold.p + ' 100');
        }
        pulse.style.display = s.pulse ? '' : 'none';
        if (s.pulse) {
            pulse.style.transform = 'translate(' + px(s.pulse.x) + ',' + px(s.pulse.y) + ') scale(' + (1 + 0.6 * ease.outCubic(s.pulse.p)) + ')';
            pulse.style.opacity = String(1 - s.pulse.p);
        }
        chip.style.opacity = String(s.chip ? s.chip.alpha : 0);
        if (s.chip) {
            chip.style.transform = 'translate(' + px(s.chip.x) + ',' + px(s.chip.y) + ') translate(-50%, -50%)';
            if (chip.textContent !== s.chip.text) chip.textContent = s.chip.text;
        }
        scroll.style.display = s.scroll ? '' : 'none';
        if (s.scroll) {
            scroll.style.transform = 'translate(' + px(s.scroll.x + 44) + ',' + px(s.scroll.y) + ')';
            const v = s.scroll.v;
            scrollFill.style.transform = 'translateY(' + px(v > 0 ? 0 : 28 * v) + ')';
            scrollFill.style.height = px(28 * Math.abs(v));
            scroll.classList.toggle('is-up', v < -0.05);
            scroll.classList.toggle('is-down', v > 0.05);
        }

        drawLeft(s.left);
        drawRight(s.right);
        drawHandFigure(figures.left, s.left);
        drawHandFigure(figures.right, s.right);
    }

    function fit(width: number) {
        desk.style.transform = 'scale(' + width / W + ')';
    }

    return { draw, fit, figures };
}
