export function wait(time: number) {
    return new Promise((nothing) => setTimeout(nothing, time))
}