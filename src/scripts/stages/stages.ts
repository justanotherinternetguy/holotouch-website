// The looping demonstrations of the control panel's gesture guide (GestureStage.qml), one for each
// gesture: an illustrated hand, and what it acts on. Each is drawn on a 170 by 104 unit stage and
// is a function of time alone.
import { el } from '../svg';
import { ease, track, sway } from '../motion/ease';
import { Hand } from '../hand/hand';

export type Update = (t: number) => void;

function about(cx: number, cy: number, scale: number): string {
    return 'translate(' + cx + ' ' + cy + ') scale(' + scale + ') translate(' + -cx + ' ' + -cy + ')';
}

class Kit {
    constructor(public svg: SVGSVGElement) {}
    group(parent?: Element): SVGGElement { return el('g', {}, parent || this.svg); }
    pane(parent: Element, x: number, y: number, w = 56, h = 38): SVGRectElement {
        return el('rect', { 'class': 'st-pane', x, y, width: w, height: h, rx: 8 }, parent);
    }
    hand(parent: Element, pose: string, x: number, y: number, size: number, side?: 'left' | 'right'): Hand {
        const hand = new Hand({ pose, side });
        parent.appendChild(hand.place(x, y, size).g);
        return hand;
    }
    /** A ring that fills clockwise from twelve; returns the setter for how far, in degrees. */
    ring(cx: number, cy: number, r: number, trackWidth: number, arcWidth: number): (sweep: number) => void {
        el('circle', { 'class': 'st-ring', cx, cy, r, 'stroke-width': trackWidth }, this.svg);
        const arc = el('circle', {
            'class': 'st-arc', cx, cy, r, 'stroke-width': arcWidth, pathLength: 360,
            transform: 'rotate(-90 ' + cx + ' ' + cy + ')'
        }, this.svg);
        return (sweep) => { arc.setAttribute('stroke-dasharray', sweep + ' 360'); };
    }
}

const ENTER = 'M19 6 L19 11 A3 3 0 0 1 16 14 L5 14 M9.5 9.5 L5 14 L9.5 18.5';

const stages: Record<string, (k: Kit) => Update> = {
    move(k) {
        const both = k.group();
        k.pane(both, 44, 36);
        k.hand(both, 'index', 59, 28, 64);
        const x = sway(-18, 18);
        return (t) => { both.setAttribute('transform', 'translate(' + x(t) + ' 0)'); };
    },

    resize(k) {
        const pane = k.pane(k.svg, 56, 34, 62, 40);
        const left = k.hand(k.svg, 'index', 17, 48, 52, 'left');
        const right = k.hand(k.svg, 'index', 105, 10, 52);
        const scale = sway(1, 1.26);
        const lx = sway(17, 8), ly = sway(48, 55), rx = sway(105, 114), ry = sway(10, 3);
        return (t) => {
            pane.setAttribute('transform', about(87, 54, scale(t)));
            left.place(lx(t), ly(t), 52);
            right.place(rx(t), ry(t), 52);
        };
    },

    flick(k) {
        el('rect', { 'class': 'st-bar', x: 18, y: 7, width: 134, height: 3, rx: 1.5 }, k.svg);
        const both = k.group();
        k.pane(both, 50, 40, 50, 34);
        k.hand(both, 'index', 63, 33, 58);
        const y = track(12, [['p', 1300], ['to', -22, 220, ease.outCubic], ['p', 700], ['to', 12, 400, ease.sine]]);
        return (t) => { both.setAttribute('transform', 'translate(0 ' + y(t) + ')'); };
    },

    edge(k) {
        el('rect', { 'class': 'st-ink', x: 160, y: 18, width: 20, height: 68, rx: 10 }, k.svg);
        const fill = el('rect', { 'class': 'st-butter', x: 160, width: 20, rx: 10 }, k.svg);
        const both = k.group();
        k.pane(both, 84, 36);
        k.hand(both, 'index', 106, 30, 58);
        const height = track(0, [['p', 1500], ['to', 68, 1300], ['p', 300], ['set', 0], ['p', 500]]);
        const x = track(-34, [['p', 300], ['to', 0, 1100, ease.sine], ['p', 1700], ['to', -34, 500, ease.sine]]);
        return (t) => {
            const h = height(t);
            fill.setAttribute('height', String(h));
            fill.setAttribute('y', String(52 - h / 2));
            both.setAttribute('transform', 'translate(' + x(t) + ' 0)');
        };
    },

    // The thumb is held out to take aim, then comes down: the ripple leaves as it lands.
    click(k) {
        const ripple = el('circle', { 'class': 'st-ripple', cx: 84, cy: 53, r: 14 }, k.svg);
        const hand = k.hand(k.svg, 'press', 53, 20, 64);
        return (t) => {
            t %= 1700;
            const down = t >= 800;
            const p = down ? (t - 800) / 900 : 1;
            hand.setPose(down ? 'press' : 'aim');
            ripple.setAttribute('transform', about(84, 53, 0.4 + 1.6 * ease.outCubic(p)));
            ripple.setAttribute('opacity', String(1 - p));
        };
    },

    menu(k) {
        k.hand(k.svg, 'pinky', 55, 30, 60);
        const buds = ([[75, 14, 'butter'], [109, 38, 'lilac'], [97, 78, 'mint'], [53, 78, 'butter'], [41, 38, 'lilac']] as [number, number, string][])
            .map((bud, i) => ({
                cx: bud[0] + 8, cy: bud[1] + 8,
                node: el('circle', { 'class': 'st-bud st-' + bud[2], cx: bud[0] + 8, cy: bud[1] + 8, r: 8 }, k.svg),
                scale: track(0, [['set', 0], ['p', 500 + 60 * i], ['to', 1, 280, ease.outBack], ['p', 1700 - 60 * i], ['to', 0, 160]])
            }));
        return (t) => {
            buds.forEach((b) => { b.node.setAttribute('transform', about(b.cx, b.cy, b.scale(t))); });
        };
    },

    close(k) {
        const fill = k.ring(85, 52, 36, 9, 7);
        k.hand(k.svg, 'fist', 55, 16, 60);
        const sweep = track(1, [['p', 400], ['to', 360, 2000], ['p', 500], ['set', 1]]);
        return (t) => { fill(sweep(t)); };
    },

    scroll(k) {
        const hand = k.hand(k.svg, 'two', 53, 20, 64);
        const tilt = sway(0, 18, 1000);
        return (t) => { hand.place(53, 20, 64, { deg: tilt(t), x: 85, y: 84 }); };
    },

    knob(k) {
        const hand = k.hand(k.svg, 'claw', 53, 20, 64);
        const turn = sway(-18, 24, 1200);
        return (t) => { hand.place(53, 20, 64, { deg: turn(t), x: 85, y: 52 }); };
    },

    // The open hand is swept to the right, and the Enter key goes down as it gets there.
    swipe(k) {
        const key = k.group();
        el('rect', { 'class': 'st-pane', x: 14, y: 60, width: 34, height: 30, rx: 8 }, key);
        el('path', { 'class': 'st-icon', d: ENTER, transform: 'translate(22 66) scale(0.75)' }, key);
        const hand = k.hand(k.svg, 'open', 30, 12, 62);
        const press = track(1, [['p', 1150], ['to', 0.8, 90], ['to', 1, 220, ease.outBack], ['p', 1260]]);
        const x = track(30, [['p', 900], ['to', 100, 320, ease.outCubic], ['p', 900], ['to', 30, 600, ease.sine]]);
        return (t) => {
            key.setAttribute('transform', about(31, 75, press(t)));
            hand.place(x(t), 12, 62);
        };
    },

    // A chin, and a fist coming up to it.
    switcher(k) {
        el('circle', { 'class': 'st-chin', cx: 85, cy: -14, r: 34 }, k.svg);
        const hand = k.hand(k.svg, 'fist', 55, 44, 60);
        const y = track(44, [['p', 700], ['to', 6, 600, ease.outCubic], ['p', 1100], ['to', 44, 500, ease.sine]]);
        return (t) => { hand.place(55, y(t), 60); };
    },

    camera(k) {
        k.hand(k.svg, 'peace', 2, 24, 62, 'left');
        k.hand(k.svg, 'peace', 106, 24, 62);
        const fill = k.ring(85, 52, 17, 7, 6);
        const sweep = track(1, [['p', 400], ['to', 360, 2400], ['p', 500], ['set', 1]]);
        return (t) => { fill(sweep(t)); };
    },

    // The sign is held and words come; it is dropped, and they are in the text box.
    dictate(k) {
        k.hand(k.svg, 'y', 4, 22, 62);
        k.pane(k.svg, 72, 34, 88, 36);
        let x = 82;
        const words = [14, 9, 17, 11].map((width) => {
            const word = { end: x + width + 4, node: el('rect', { 'class': 'st-ink', x, y: 49, width, height: 6, rx: 3 }, k.svg) };
            x = word.end;
            return word;
        });
        const caret = el('rect', { 'class': 'st-caret', y: 44, width: 2.5, height: 16 }, k.svg);
        const said = track(0, [['set', 0], ['p', 500], ['to', 1, 1500], ['p', 1200]]);
        return (t) => {
            const now = said(t) * 4;
            let at = 82;
            words.forEach((word, i) => {
                const shown = now > i + 0.5;
                word.node.setAttribute('visibility', shown ? 'visible' : 'hidden');
                if (shown) at = word.end;
            });
            caret.setAttribute('x', String(at));
        };
    },

    // The sign is held up, and the letters come one after the other.
    spell(k) {
        k.hand(k.svg, 'ily', 4, 22, 62);
        const tiles = ['R', 'S'].map((letter, i) => {
            const x = 82 + 38 * i;
            const tile = el('rect', { 'class': 'st-tile', x, y: 36, width: 32, height: 34, rx: 8 }, k.svg);
            const text = el('text', { 'class': 'st-letter', x: x + 16, y: 53.5 }, k.svg);
            text.textContent = letter;
            return { tile, text };
        });
        return (t) => {
            t %= 2800;
            const taken = t < 700 ? 0 : t < 1400 ? 1 : 2;
            tiles.forEach((it, i) => {
                it.tile.setAttribute('class', 'st-tile' + (taken > i ? (taken >= 2 ? ' is-done' : ' is-taken') : ''));
                it.text.setAttribute('visibility', taken > i ? 'visible' : 'hidden');
            });
        };
    },

    // The hands meet twice, and a tab is added to the row of them.
    clap(k) {
        const tabs = [0, 1, 2].map((i) =>
            el('rect', { 'class': 'st-pane' + (i === 2 ? ' st-mint' : ''), x: 43 + 30 * i, y: 8, width: 26, height: 14, rx: 5 }, k.svg));
        const left = k.hand(k.svg, 'open', 6, 34, 60, 'left');
        const right = k.hand(k.svg, 'open', 104, 34, 60);
        const apart = track(1, [['p', 500], ['to', 0, 130, ease.inQuad], ['to', 1, 190, ease.outQuad],
                                ['to', 0, 130, ease.inQuad], ['to', 1, 190, ease.outQuad], ['p', 1500]]);
        return (t) => {
            const a = apart(t);
            left.place(28 - 22 * a, 34, 60);
            right.place(82 + 22 * a, 34, 60);
            tabs[2].setAttribute('visibility', t % 2640 >= 950 ? 'visible' : 'hidden');
        };
    },

    // The open hand is tossed upward from rest, and the page turns up on the phone.
    toss(k) {
        const phone = el('rect', { 'class': 'st-pane', x: 118, y: 22, width: 34, height: 58, rx: 9 }, k.svg);
        el('rect', { 'class': 'st-ink', x: 130, y: 70, width: 10, height: 2.5, rx: 1.25 }, k.svg);
        const hand = k.hand(k.svg, 'open', 34, 40, 60);
        const y = track(40, [['p', 900], ['to', 2, 300, ease.outCubic], ['p', 1100], ['to', 40, 600, ease.sine]]);
        return (t) => {
            hand.place(34, y(t), 60);
            phone.setAttribute('class', t % 2900 >= 1200 ? 'st-pane st-mint' : 'st-pane');
        };
    }
};

/** The moment of each loop that says most about it, for when motion is not wanted. */
export const STILLS: Record<string, number> = {
    edge: 2200, click: 900, menu: 1500, close: 1500, camera: 1700, dictate: 1900, spell: 1500, swipe: 1200, switcher: 1600, toss: 1500
};

/** Draw `gesture` into `slot`. Returns what sets the stage to a time in milliseconds. */
export function mountStage(slot: Element, gesture: string): Update {
    const svg = el('svg', { 'class': 'stage', viewBox: '0 0 170 104', 'aria-hidden': 'true' }, slot);
    const update = (stages[gesture] || stages.move)(new Kit(svg));
    update(0);
    return update;
}
