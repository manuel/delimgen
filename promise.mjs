/*
 * Optional utilities for dealing with promises and asynchronous functions.
 */

import { suspend, resume } from "./index.mjs";

/*
 * Suspends the current generator and waits for the promise to settle.
 *
 * If the promise resolves, resume and return its result at the point
 * where the generator was suspended.  If it rejects, resume and throw
 * its error.
 */
export function* await_promise(promise)
{
    return yield* suspend(function* (generator) {
        return promise.then((value) => resume(generator, function* () { return value; }).next(),
                            (error) => resume(generator, function* () { throw error; }).next());
    });
}

/*
 * Turns a promise-returning asynchronous function into a generator
 * (see sleep.mjs).
 */
export function sync(async_function)
{
    return function* (...args) { return yield* await_promise(async_function(...args)); }
}
