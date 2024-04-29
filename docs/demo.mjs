import { run, suspend, resume } from "../index.mjs";
import { sleep } from "../sleep.mjs";
import { EventManager } from "../event.mjs";

function* ball(x, y)
{
    while (true)
    {
        yield* sleep(2000);
    }
}

const event_manager = new EventManager();

function* main_loop()
{
    // Spawn some pre-existing balls
    yield* run(ball(100, 200));
    yield* run(ball(400, 600));
    yield* run(ball(200, 800));
    // Wait for click events, spawn a new ball on each click
    while (true) {
        const event = yield* event_manager.get_next_event();
        console.log(event.pageX);
    }
}

window.onload = () => run(main_loop()).next();

window.onclick = (event) => event_manager.inject_event(event).next();
