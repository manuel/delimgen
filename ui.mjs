import { $push_prompt, $take_subcont, $push_delim_subcont } from "./chicane.mjs";

class UI
{
    *$run()
    {
        while (true) {
            const evt = yield* $get_next_event();
            console.log(evt);
            yield* $sleep(100);
            console.log("slept 1");
            yield* $sleep(100);
            console.log("slept 2");
        }
    }
}

window.onload = () => $push_prompt(new UI().$run()).next();

window.onclick = (evt) => $inject_event(evt).next();

let saved_coroutine = null;

function* $get_next_event()
{
    return yield* $take_subcont(function* (gen) { saved_coroutine = gen; });
}

function* $inject_event(evt)
{
    if (saved_coroutine !== null) {
        const gen = saved_coroutine;
        saved_coroutine = null;
        yield* $push_delim_subcont(gen, function* () { return evt; });
    } else {
        console.log("dropped event", evt);
    }
}

function* $await_promise(promise)
{
    return yield* $take_subcont(function* (gen) {
        promise.then((value) => $push_delim_subcont(gen, function*(){ return value; }).next(),
                     (error) => $push_delim_subcont(gen, function*(){ throw error; }).next());
    });
}

function sync(fun)
{
    return function*(...args) { return yield* $await_promise(fun(...args)); }
}

function sleep_async(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

const $sleep = sync(sleep_async);
