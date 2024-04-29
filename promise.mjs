/*
 * Optional utilities for dealing with promises and asynchronous functions.
 */

import { suspend, resume } from "./index.mjs";

/*
 * Suspends the current generator and waits for the promise to settle.
 *
 * If the promise resolves, resume the generator and return its result
 * at the point where the generator was suspended.  If it rejects,
 * resume and throw its error.
 *
 * Returns a promise so generator-based code can readily be plugged
 * into e.g. test frameworks that work with promises.
 */
export function* await_promise(promise)
{
    return yield* suspend(function* (generator) {
        return promise.then((value) => resume(generator, function* () { return value; }).next(),
                            (error) => resume(generator, function* () { throw error; }).next());
    });
}

/*
 * Turns a promise-returning asynchronous function into a blocking
 * generator function (see sleep.mjs for an example).
 */
export function sync(async_function)
{
    return function* (...args) { return yield* await_promise(async_function(...args)); }
}
