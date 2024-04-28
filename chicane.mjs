export const DEFAULT_PROMPT = "default";

class Suspension
{
    constructor(handler, prompt = DEFAULT_PROMPT)
    {
        this.handler = handler;
        this.prompt = prompt;
    }
    get_suspension_handler() { return this.handler; }
    get_prompt() { return this.prompt; }
}

class Resumption
{
    constructor(handler)
    {
        this.handler = handler;
    }
    get_resumption_handler() { return this.handler; }
}

export function* push_prompt(gen, prompt)
{
    return yield* push_action(gen, () => gen.next(), prompt);
}

export function* push_delim_subcont(gen, resumption_handler, prompt)
{
    return yield* push_action(gen, () => gen.next(new Resumption(resumption_handler)), prompt);
}

function* push_action(gen, action, prompt = DEFAULT_PROMPT)
{
    while (true) {
        const res = action();
        if (res.done) {
            return res.value;
        } else if (res.value.get_prompt() === prompt) {
            const suspension_handler = res.value.get_suspension_handler();
            return yield* suspension_handler(gen);
        } else {
            const resumption = yield res.value;
            const resumption_handler = resumption.get_resumption_handler();
            action = () => gen.next(new Resumption(resumption_handler));
        }
   }
}

export function* take_subcont(suspension_handler, prompt)
{
    const resumption = yield new Suspension(suspension_handler, prompt);
    const resumption_handler = resumption.get_resumption_handler();
    return yield* resumption_handler();
}
