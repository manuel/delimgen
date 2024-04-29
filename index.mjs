/*
 * Main code.  This is the only required file.
 */

/*
 * A suspension is an internal object that is yielded by a suspending
 * generator.
 *
 * It contains a suspension handler - a generator function that will
 * be called with the suspended generator as its argument at the point
 * where the generator was originally run.
 */
class Suspension
{
    constructor(handler)
    {
        this.handler = handler;
    }
    get_suspension_handler() { return this.handler; }
}

/*
 * A resumption is an internal object that is sent back into a
 * suspended generator to resume it.
 *
 * It contains a resumption handler - a generator function that will
 * be called (without arguments) at the point where the generator was
 * previously suspended.
 */
class Resumption
{
    constructor(handler)
    {
        this.handler = handler;
    }
    get_resumption_handler() { return this.handler; }
}

/*
 * API entry point to run a generator that can use suspend() and resume().
 */
export function* run(generator)
{
    const action = () => generator.next();
    return yield* push_action(generator, action);
}

/*
 * API entry point to resume a suspended generator with a resumption handler.
 */
export function* resume(generator, resumption_handler)
{
    const action = () => generator.next(new Resumption(resumption_handler));
    return yield* push_action(generator, action);
}

/*
 * Internal function that's the basis for running or resuming a generator.
 */
function* push_action(generator, action)
{
    /*
     * Start or resume the generator.
     */
    const result = action();
    if (result.done) {
        /*
         * The generator finished, return its result.
         */
        return result.value;
    } else {
        /*
         * The generator yielded a Suspension.  Call the suspension
         * handler with the generator as argument.
         */
        const suspension = result.value;
        const suspension_handler = suspension.get_suspension_handler();
        return yield* suspension_handler(generator);
    }
}

/*
 * API entry point to suspend a generator with a suspension handler.
 */
export function* suspend(suspension_handler)
{
    /*
     * Yield a Suspension.  Once we receive the corresponding
     * Resumption, call the resumption handler.
     */
    const resumption = yield new Suspension(suspension_handler);
    const resumption_handler = resumption.get_resumption_handler();
    return yield* resumption_handler();
}
