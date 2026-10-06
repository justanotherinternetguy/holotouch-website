// The illustrated hand of the control panel (HandFigure.qml), drawn as SVG: a palm and five capsule
// fingers on a 96-unit grid. Coral is the right hand and sky the left. A hand turns from one pose
// into the next rather than being swapped for it, and can be blended or drawn on by hand for
// scroll-driven scenes.
import { el } from '../svg';
import { ticker } from '../motion/ticker';
import { POSES, TOUCHES, pathOf } from './poses';
import { landmarksOf, BONES } from './landmarks';

export interface HandOptions {
    side?: 'left' | 'right';
    pose?: string;
    plain?: boolean;
    /** Also draw the 21 landmarks and the bones between them (hidden until shown). */
    landmarks?: boolean;
}
export interface Turn { deg: number; x: number; y: number; }

const MORPH_MS = 150;
const PALM = { x: 31, y: 46, width: 36, height: 36, rx: 15 };

interface Morph {
    from: number[]; to: number[];
    touchFrom: number[]; touchTo: number[];
    touchingFrom: number; touchingTo: number;
    start: number | null;
}

export class Hand {
    side: 'left' | 'right';
    pose: string;
    g: SVGGElement;
    svg!: SVGSVGElement;
    private inner: SVGGElement;
    private under: SVGPathElement;
    private over: SVGPathElement;
    private palms: SVGRectElement[];
    private dot: SVGCircleElement;
    private dots: SVGCircleElement[] = [];
    private bones: SVGLineElement[] = [];
    points: number[];
    touch: number[];
    touching: number;
    private morph: Morph | null = null;

    constructor(options: HandOptions = {}) {
        this.side = options.side === 'left' ? 'left' : 'right';
        this.pose = options.pose && POSES[options.pose] ? options.pose : 'open';
        this.g = el('g', {
            'class': 'hand' + (this.side === 'left' ? ' hand--left' : '') + (options.plain ? ' hand--plain' : '')
        });
        // The left hand is the right one mirrored.
        this.inner = el('g', this.side === 'left' ? { transform: 'translate(96 0) scale(-1 1)' } : {}, this.g);
        this.under = el('path', { 'class': 'hand__ink' }, this.inner);
        const palmInk = el('rect', { 'class': 'hand__palm-ink', ...PALM }, this.inner);
        this.over = el('path', { 'class': 'hand__tone' }, this.inner);
        const palm = el('rect', { 'class': 'hand__palm', ...PALM }, this.inner);
        this.palms = [palmInk, palm];
        this.dot = el('circle', { 'class': 'hand__dot', r: 6.75 }, this.inner);

        if (options.landmarks) {
            const bones = el('g', { 'class': 'hand__bones' }, this.inner);
            this.bones = BONES.map(() => el('line', { 'class': 'hand__bone' }, bones));
            const dots = el('g', { 'class': 'hand__lms' }, this.inner);
            this.dots = landmarksOf(POSES[this.pose]).map(() => el('circle', { 'class': 'hand__lm', r: 2.6 }, dots));
        }

        this.points = POSES[this.pose].slice();
        this.touch = (TOUCHES[this.pose] || [46, 50]).slice();
        this.touching = TOUCHES[this.pose] ? 1 : 0;
        this.step = this.step.bind(this);
        this.draw();
    }

    /** Put the hand's 96-unit grid at x, y, `size` units across, turned by `turn` if given. */
    place(x: number, y: number, size: number, turn?: Turn): this {
        let transform = 'translate(' + x + ' ' + y + ') scale(' + size / 96 + ')';
        if (turn) transform = 'rotate(' + turn.deg + ' ' + turn.x + ' ' + turn.y + ') ' + transform;
        this.g.setAttribute('transform', transform);
        return this;
    }

    draw(): void {
        const d = pathOf(this.points);
        this.under.setAttribute('d', d);
        this.over.setAttribute('d', d);
        this.dot.setAttribute('cx', String(this.touch[0]));
        this.dot.setAttribute('cy', String(this.touch[1]));
        this.dot.setAttribute('opacity', String(this.touching));
        this.dot.setAttribute('r', String(6.75 * (0.4 + 0.6 * this.touching)));
        if (this.dots.length) {
            const lm = landmarksOf(this.points);
            lm.forEach((pt, i) => {
                this.dots[i].setAttribute('cx', pt[0].toFixed(2));
                this.dots[i].setAttribute('cy', pt[1].toFixed(2));
            });
            BONES.forEach((bone, i) => {
                const line = this.bones[i];
                line.setAttribute('x1', lm[bone[0]][0].toFixed(2));
                line.setAttribute('y1', lm[bone[0]][1].toFixed(2));
                line.setAttribute('x2', lm[bone[1]][0].toFixed(2));
                line.setAttribute('y2', lm[bone[1]][1].toFixed(2));
            });
        }
    }

    /** Turn into `pose` over 150 ms (or at once). */
    setPose(pose: string, instant = false): void {
        if (!POSES[pose] || pose === this.pose) return;
        this.pose = pose;
        const touch = TOUCHES[pose];
        this.morph = {
            from: this.points.slice(), to: POSES[pose],
            // A dot that was not showing starts where it is going, so it does not slide in.
            touchFrom: this.touching > 0.05 ? this.touch.slice() : (touch || this.touch).slice(),
            touchTo: (touch || this.touch).slice(),
            touchingFrom: this.touching, touchingTo: touch ? 1 : 0,
            start: instant ? -Infinity : null
        };
        if (instant) this.step(0);
        else ticker.add(this.step);
    }

    /** Set the hand to the blend of two poses, for scenes that are scrubbed rather than played. */
    blend(from: string, to: string, p: number): void {
        const a = POSES[from], b = POSES[to];
        if (!a || !b) return;
        if (this.morph) { this.morph = null; ticker.remove(this.step); }
        this.pose = p < 0.5 ? from : to;
        for (let i = 0; i < 30; i++) this.points[i] = a[i] + (b[i] - a[i]) * p;
        const ta = TOUCHES[from], tb = TOUCHES[to];
        const at = tb || ta || [46, 50];
        this.touch[0] = at[0];
        this.touch[1] = at[1];
        this.touching = (ta ? 1 : 0) + ((tb ? 1 : 0) - (ta ? 1 : 0)) * p;
        this.draw();
    }

    /** Draw the hand on, finger by finger: 0 is nothing, 1 the whole hand. */
    reveal(p: number): void {
        p = Math.min(1, Math.max(0, p));
        const palmP = Math.min(1, p * 3);
        this.palms.forEach((palm) => {
            palm.setAttribute('transform', 'translate(49 64) scale(' + palmP + ') translate(-49 -64)');
        });
        const fingerP = Math.max(0, (p - 0.15) / 0.85);
        [this.under, this.over].forEach((path) => {
            path.setAttribute('pathLength', '100');
            path.style.strokeDasharray = '100 100';
            path.style.strokeDashoffset = String(100 * (1 - fingerP));
        });
        // The touch dot keeps its own opacity (the pose decides it) once the hand is whole.
        this.dot.style.opacity = p >= 1 ? '' : '0';
    }

    /** Show the landmark dots and bones: 0 to 1, in the tracker's order. */
    showLandmarks(dotsP: number, bonesP: number): void {
        const n = this.dots.length;
        this.dots.forEach((dot, i) => {
            const local = Math.min(1, Math.max(0, dotsP * (n + 4) - i) / 4);
            const s = local < 1 ? 1.6 * local - 0.6 * local * local : 1;
            dot.style.transform = 'scale(' + Math.max(0, s) + ')';
        });
        const m = this.bones.length;
        this.bones.forEach((line, i) => {
            line.style.opacity = String(Math.min(1, Math.max(0, bonesP * (m + 3) - i) / 3));
        });
    }

    private step(now: number): void {
        const m = this.morph;
        if (!m) return;
        if (m.start === null) m.start = now;
        const raw = Math.min(1, (now - m.start) / MORPH_MS);
        const p = 1 - Math.pow(1 - raw, 3);
        for (let i = 0; i < 30; i++) this.points[i] = m.from[i] + (m.to[i] - m.from[i]) * p;
        this.touch[0] = m.touchFrom[0] + (m.touchTo[0] - m.touchFrom[0]) * p;
        this.touch[1] = m.touchFrom[1] + (m.touchTo[1] - m.touchFrom[1]) * p;
        this.touching = m.touchingFrom + (m.touchingTo - m.touchingFrom) * p;
        this.draw();
        if (raw >= 1) {
            this.morph = null;
            ticker.remove(this.step);
        }
    }

    /** A hand on its own, as an <svg> to put in the page. */
    static figure(options: HandOptions = {}): Hand {
        const hand = new Hand(options);
        hand.svg = el('svg', { viewBox: '0 0 96 96', 'class': 'figure', 'aria-hidden': 'true' });
        hand.svg.appendChild(hand.g);
        return hand;
    }
}
