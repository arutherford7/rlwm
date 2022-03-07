import * as util from './util'
import * as state from './state'

function initial_instructions() {
  const page = util.make_page();

  const text = util.make_page();
  text.style.color = 'white';
  text.innerText = 'These are example instructions.';

  const next_button = document.createElement('button');
  next_button.innerText = 'Click next';
  next_button.onclick = () => {
    util.remove_page(page)
    state.next(new_block);
  }

  page.appendChild(text);
  page.appendChild(next_button);
  util.append_page(page);
}

function new_block() {
  const page = util.make_page();
  page.style.color = 'white';
  page.innerText = 'example new block';
  util.append_page(page);

  util.wait_for_space_bar(() => {
    util.remove_page(page);
    state.done();
  });
}

export function run(): Promise<void> {
  state.next(initial_instructions);
  return state.run();
}