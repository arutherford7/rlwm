import * as util from './util';
import * as state from './state';
import { config } from './config';

function initial_instructions() {
  const page = util.make_page();

  const text = util.make_page();
  text.style.color = 'white';
  text.innerText = 'These are example instructions.';

  const next_button = document.createElement('button');
  next_button.innerText = 'Click next';
  next_button.onclick = () => {
    util.remove_page(page);
    if (config.go_fullscreen) {
      state.next(go_fullscreen);
    } else {
      state.done();
    }
  }

  page.appendChild(text);
  page.appendChild(next_button);
  util.append_page(page);
}

function go_fullscreen() {
  const page = util.make_page();

  const button = document.createElement('button');
  button.innerText = 'Click to enter full screen.';
  button.onclick = _ => {
    util.enter_fullscreen(() => {
      util.remove_page(page);
      state.done();
    }, () => {
      // try again.
      util.remove_page(page);
      state.next(go_fullscreen);
    });
  }

  page.appendChild(button);
  util.append_page(page);
}

export function run(): Promise<void> {
  state.next(initial_instructions);
  return state.run();
}