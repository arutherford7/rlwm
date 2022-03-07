const states: Array<() => void> = [];
let interval_id: number | null = null;
let on_complete = () => {};

export function next(state: () => void): void {
  states.push(state);
}

function stop() {
  if (interval_id !== null) {
    clearInterval(interval_id);
    interval_id = null;
  }
}

export function done() {
  on_complete();
}

export function run(): Promise<void> {
  return new Promise((resolve, _) => {
    stop();
    on_complete = resolve;
    let id: any = setInterval(() => {
      if (states.length > 0) {
        const state = states[0];
        states.splice(0, 1);
        state();
      }
    }, 1);
    interval_id = id;
  });
}