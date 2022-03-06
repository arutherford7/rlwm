const states: Array<() => void> = [];
let interval_id: number | null = null;

export function next(state: () => void): void {
  states.push(state);
}

export function stop() {
  if (interval_id !== null) {
    clearInterval(interval_id);
    interval_id = null;
  }
}

export function run() {
  stop();
  let id: any = setInterval(() => {
    if (states.length > 0) {
      const state = states[0];
      states.splice(0, 1);
      state();
    };
  }, 1);
  interval_id = id;
}