// One callback list on one animation frame, so that a page of small loops costs one timer.
export type Tick = (now: number) => void;

const subscribers = new Set<Tick>();
let frame = 0;

function loop(now: number) {
    frame = 0;
    subscribers.forEach((fn) => fn(now));
    if (subscribers.size) frame = requestAnimationFrame(loop);
}

export const ticker = {
    add(fn: Tick) {
        subscribers.add(fn);
        if (!frame) frame = requestAnimationFrame(loop);
    },
    remove(fn: Tick) {
        subscribers.delete(fn);
    }
};
