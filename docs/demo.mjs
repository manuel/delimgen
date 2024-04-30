import { run, suspend, resume } from "../index.mjs";
import { sleep } from "../sleep.mjs";
import { get_next_event, inject_event } from "../event.mjs";

function* ball(x, y)
{
    while (true)
    {
        console.log(x, y);
        yield* sleep(2000);
    }
}

function* main()
{
    // Spawn some pre-existing balls
    yield* run(ball(100, 200));
    yield* run(ball(400, 600));
    yield* run(ball(200, 800));
    // Wait for click events, spawn a new ball on each click
    while (true) {
        const event = yield* get_next_event();
        yield* run(ball(event.pageX, event.pageY));
    }
}

window.onload = () => run(main()).next();

window.onclick = (event) => inject_event(event).next();
