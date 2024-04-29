/*
 * Optional utility for sleeping a generator.
 */

import { sync } from "./promise.mjs";

/*
 * Asynchronous function that returns a promise that sleeps for milliseconds.
 */
function sleep_async(milliseconds)
{
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/*
 * Generator that sleeps for milliseconds.
 */
export const sleep = sync(sleep_async);
