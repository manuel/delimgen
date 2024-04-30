/*
 * Optional utility for dealing with asynchronously arriving events,
 * like in the browser.
 */

import { suspend, resume } from "./index.mjs";

/*
 * There should be a single event manager and a single main generator
 * reading events from it in an app.
 *
 * Events arriving from event handlers (e.g. `window.onclick`) should be
 * piped into the `inject_event` method.
 *
 * The main generator can block on events by calling `get_next_event`.
 *
 * This currently doesn't do any queueing - if an event arrives when
 * the main generator isn't waiting for an event (which can happen
 * when it is doing another async task, like a network request), the
 * event is simply dropped.
 *
 * This is implemented as a class so that users can subclass it, and
 * override behavior for what should happen when a concurrent
 * `get_next_event` happens, or when an event is dropped.
 */
export class EventManager
{
    constructor()
    {
        /*
         * Internally, we save a reference to the generator blocking
         * on an event.
         *
         * When an event arrives, we resume the generator with the
         * event as the result of the call to get_next_event().
         */
        this.waiting_generator = null;
    }

    /*
     * Suspend the current generator until an event arrives.
     *
     * The generator gets saved in the waiting_generator property.
     */
    *get_next_event()
    {
        const self = this;
        return yield* suspend(function* (generator) {
            if (self.waiting_generator === null) {
                /*
                 * Set the waiting generator to the generator that
                 * performed the call to get_next_event().
                 */
                self.waiting_generator = generator;
            } else {
                /*
                 * A generator is already waiting for an event.  This
                 * is a bug in the application - only one generator
                 * should be reading events.
                 */
                self.on_concurrent_get_next_event();
            }
        });
    }

    /*
     * Add an event coming from an external event handler.
     *
     * Wake up the waiting generator and return the event from its
     * call to get_next_event().
     */
    *inject_event(event)
    {
        if (this.waiting_generator !== null) {
            /*
             * Resume the waiting generator, and set the
             * waiting_generator property to null, so we don't
             * accidentally resume it twice.
             */
            const generator = this.waiting_generator;
            this.waiting_generator = null;
            yield* resume(generator, function* () { return event; });
        } else {
            /*
             * No generator is waiting for an event, drop it.
             */
            this.on_dropped_event(event);
        }
    }

    /*
     * This method gets called when more than one generator attempts
     * to read events.  You can override it.
     *
     * This indicates a bug in the application and should always throw.
     */
    on_concurrent_get_next_event()
    {
        throw "Concurrent attempt at get_next_event";
    }

    /*
     * This method gets called when an event arrives, but no generator
     * is waiting for an event.  You can override it.
     *
     * This can happen for example when the event-handling generator
     * is currently performing some other async task like a network
     * request.
     */
    on_dropped_event(event)
    {
        console.log("Dropped event", event)
    }
}
