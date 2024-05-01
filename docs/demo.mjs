import { run, suspend, resume } from "../index.mjs";
import { sleep } from "../sleep.mjs";
import { get_next_event, inject_event } from "../event.mjs";

function* rect(x, y)
{
    const rect = document.createElement("div");
    rect.classList.add("rect");
    rect.style.left = x + "px";
    rect.style.top = y + "px";
    document.body.appendChild(rect);
    const xdelta = rand(0, 5);
    const ydelta = rand(0, 5);
    while (true)
    {
        x += xdelta;
        y += ydelta;
        rect.style.left = x + "px";
        rect.style.top = y + "px";
        yield* sleep(50);
    }
}

function* main()
{
    /*
     * Spawn some pre-existing rects.
     */
    yield* run(rect(100, 200));
    yield* run(rect(200, 300));
    yield* run(rect(300, 400));
    /*
     * Wait for click events, spawn a new rect on each click.
     */
    while (true) {
        const event = yield* get_next_event();
        yield* run(rect(event.pageX, event.pageY));
    }
}

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

window.onload = () => run(main()).next();

window.onclick = (event) => inject_event(event).next();
