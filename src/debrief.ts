import * as util from './util';
import * as state from './state';
import * as pages from './pages';
import { config } from './config';

function congrats() {
  let elements: HTMLDivElement[] = [];

  (() => {
    const page = util.make_text_page();
    page.innerText = `Congratulations! You won $4.50 for your performance in this game!`;
    elements.push(page);
  })();

  return pages.run(pages.make_simple_pages(elements));
}

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
  return congrats()
    .then(_ => {
      state.next(debrief);
      return state.run();
    });
}