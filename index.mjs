/*
 * Main code.  This is the only required file.
 */

/*
 * A suspension is an internal object that is yielded by a suspending
 * generator.
 *
 * It contains a suspension handler - a generator function that will
 * be called with the suspended generator as its single argument at
 * the point where the generator was originally run.
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
 * Run a generator that can use suspend() and resume().
 */
export function* run(generator)
{
    const action = () => generator.next();
    return yield* push_action(generator, action);
}

/*
 * Resume a suspended generator with a resumption handler.
 *
 * The resumption handler will be called (without arguments) at the
 * point where the generator was previously suspended.
 */
export function* resume(generator, resumption_handler)
{
    const action = () => generator.next(new Resumption(resumption_handler));
    return yield* push_action(generator, action);
}

/*
 * Internal function that's the basis for running or resuming a generator.
 *
 * (It's called push_action because it basically does the job of the
 * push_prompt and push_delim_subcont functions of caml-shift.)
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
 * Suspend the currently running generator with a suspension handler.
 *
 * The suspension handler will be called at the point where the
 * generator was originally run, and will receive the generator as its
 * single argument.
 */
export function* suspend(suspension_handler)
{
    /*
     * Yield a Suspension with the given suspension handler.  Once we
     * receive the corresponding Resumption, call the resumption
     * handler.
     */
    const resumption = yield new Suspension(suspension_handler);
    const resumption_handler = resumption.get_resumption_handler();
    return yield* resumption_handler();
}
