import { run, suspend, resume } from "./index.mjs";
import { sleep } from "./sleep.mjs";
import { Event_manager } from "./event.mjs";

function* sleeper(id)
{
    while (true)
    {
        console.log(id + " going for a nap");
        yield* sleep(2000);
    }
}

const event_manager = new Event_manager();

function* gui_loop()
{
    yield* run(sleeper(1));
    yield* run(sleeper(2));
    yield* run(sleeper(3));
    while (true) {
        const event = yield* event_manager.get_next_event();
        console.log(event);
        yield* sleep(100);
        console.log("slept 1");
        yield* sleep(100);
        console.log("slept 2");
    }
}

window.onload = () => run(gui_loop()).next();

window.onclick = (event) => event_manager.inject_event(event).next();
