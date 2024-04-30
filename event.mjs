/*
 * Optional utility for dealing with asynchronously arriving events,
 * like in the browser.
 */

import { suspend, resume } from "./index.mjs";

/*
 * Events arriving from event handlers (e.g. `window.onclick`) should
 * be piped into the `inject_event` method.
 *
 * A generator can block on events by calling `get_next_event`.
 *
 * This currently doesn't do any queueing - if an event arrives when
 * no generator isn't waiting for an event (which can happen when it
 * is doing another async task, like a network request), the event is
 * simply dropped.
 */

let waiting_generator = null;

/*
 * Suspend the calling generator until an event arrives.
 *
 * The generator gets saved in the waiting_generator property.
 */
export function* get_next_event()
{
    return yield* suspend(function* (generator) {
        if (waiting_generator === null) {
            waiting_generator = generator;
        } else {
            throw "Concurrent attempt at get_next_event";
        }
    });
}

/*
 * Add an event coming from an external event handler.
 *
 * Wake up the waiting generator and return the event from its
 * call to get_next_event().
 */
export function *inject_event(event)
{
    if (waiting_generator !== null) {
        const generator = waiting_generator;
        waiting_generator = null;
        yield* resume(generator, function* () { return event; });
    } else {
        console.log("Dropped event", event);
    }
}
