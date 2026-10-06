// The sections below the story: the gesture guide's loops, the hand shapes, the copy button, and
// the hands drawn into cards.
import { Hand } from './hand/hand';
import { ticker } from './motion/ticker';
import { mountStage, STILLS } from './stages/stages';
import { calm } from './motion/scroll';

const all = <T extends Element = HTMLElement>(selector: string) => Array.from(document.querySelectorAll<T>(selector));
const byId = (id: string) => document.getElementById(id);

function press(buttons: Element[], chosen: Element) {
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button === chosen)));
}

export function initPage() {
    // Hands written into the page as <div data-hand="index" data-side="left">.
    all('[data-hand]').forEach((slot) => {
        slot.appendChild(Hand.figure({ pose: slot.dataset.hand, side: slot.dataset.side as 'left' | 'right' }).svg);
    });

    // The gesture guide. A stage plays only while it is on screen; with reduced motion asked for,
    // each holds the moment that says most about it.
    const players = new Map<Element, (now: number) => void>();
    const watcher = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const play = players.get(entry.target);
            if (!play) return;
            if (entry.isIntersecting) ticker.add(play);
            else ticker.remove(play);
        });
    }, { rootMargin: '60px' });
    all('[data-gesture]').forEach((slot) => {
        const gesture = slot.dataset.gesture!;
        const update = mountStage(slot, gesture);
        if (calm) {
            update(STILLS[gesture] || 0);
            return;
        }
        let start: number | null = null;
        players.set(slot, (now) => {
            if (start === null) start = now;
            update(now - start);
        });
        watcher.observe(slot);
    });

    const filters = all('[data-filter]');
    const cards = all('.gcard');
    filters.forEach((button) => {
        button.addEventListener('click', () => {
            press(filters, button);
            cards.forEach((card) => {
                card.hidden = button.dataset.filter !== 'all' && card.dataset.kind !== button.dataset.filter;
            });
        });
    });

    // The hand shapes: one large hand that turns into whichever shape is picked. Until someone
    // picks one it goes through them by itself, once it is on screen.
    const well = byId('shape-hand');
    if (well) {
        const figures = { left: Hand.figure({ side: 'left' }), right: Hand.figure({ side: 'right' }) };
        well.appendChild(figures.left.svg);
        well.appendChild(figures.right.svg);
        const shapes = all('[data-shape]');
        const sides = all('[data-shape-side]');
        const note = byId('shape-note')!;
        const showSide = (side: string) => {
            figures.left.svg.style.display = side === 'left' ? '' : 'none';
            figures.right.svg.style.display = side === 'right' ? '' : 'none';
        };
        const showShape = (button: HTMLElement) => {
            press(shapes, button);
            figures.left.setPose(button.dataset.shape!);
            figures.right.setPose(button.dataset.shape!);
            note.textContent = button.dataset.note || '';
        };
        showSide('right');
        let touring = 0;
        const tour = () => {
            const at = shapes.findIndex((button) => button.getAttribute('aria-pressed') === 'true');
            showShape(shapes[(at + 1) % shapes.length]);
        };
        if (!calm) {
            new IntersectionObserver((entries) => {
                const seen = entries[0].isIntersecting;
                if (seen && !touring && !stopped) touring = window.setInterval(tour, 1800);
                if (!seen && touring) { clearInterval(touring); touring = 0; }
            }).observe(well);
        }
        let stopped = false;
        shapes.forEach((button) => {
            button.addEventListener('click', () => {
                stopped = true;
                clearInterval(touring);
                touring = 0;
                showShape(button);
            });
        });
        sides.forEach((button) => {
            button.addEventListener('click', () => {
                press(sides, button);
                showSide(button.dataset.shapeSide!);
            });
        });
    }

    const copy = byId('copy');
    copy?.addEventListener('click', () => {
        const text = (byId('commands')?.textContent || '').replace(/^\$ /gm, '');
        navigator.clipboard.writeText(text).then(() => {
            copy.textContent = 'Copied';
            setTimeout(() => { copy.textContent = 'Copy'; }, 1600);
        }, () => {
            copy.textContent = 'Select and copy';
        });
    });
}
