import * as util from './util';
import * as state from './state';
import { config } from './config';

function debrief() {
  const page = util.make_page();

  page.style.color = 'white';
  page.style.fontSize = `${config.instructions_font_size_px}px`;
  page.innerText = 'Task complete. Thank you for participating. Press Space to exit.';
  util.append_page(page);

  util.wait_for_space_bar(() => {
    util.remove_page(page);
    state.done();
  });
}

export function run(): Promise<void> {
  state.next(debrief);
  return state.run();
}