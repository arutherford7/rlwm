import * as util from './util';
import * as state from './state';
import * as pages from './pages';
import { config } from './config';

function go_fullscreen() {
  if (!config.go_fullscreen) {
    state.done();
    return;
  }

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

function make_pages() {
  const disp: HTMLDivElement[] = [];
  
  (() => {
    const page = util.make_text_page();
    page.innerText = 'Welcome to the memory game.';
    disp.push(page);
  })();
  (() => {
    const page = util.make_text_page();
    page.innerText = `There will be 12 rounds of this game, called blocks, and in each block you will see different pictures appear on the screen one at a time.`;
    disp.push(page);
  })();
  (() => {
    const page = util.make_text_page();
    page.innerText = 'Your job is to figure out which key--using C, V and B only--corresponds to which picture.'
    disp.push(page);
  })();
  (() => {
    const page = util.make_text_page();
    page.innerText = 'When you match the right key with the right picture, you will earn either 1 or 2 points. You will be guessing at first, but once you get a match right, remember which button you pressed so that you can press it the next time that picture appears.';
    disp.push(page);
  })();
  (() => {
    const page = util.make_text_page();
    page.innerText = 'It is important you do your best to get as many matches correct as possible, because the more points you earn, the more bonus money you will make in this game.'
    disp.push(page);
  })();

  return disp;
}

function run_confirm(page_elements: HTMLDivElement[]) {  
  state.next(() => {
    const page = util.make_text_page();
    page.innerText = 'If you understand these instructions, please press the spacebar to begin a practice round. Or press R to repeat these instructions.';
    util.append_page(page);

    util.wait_for_one_of_keys(['r', ' '], key => {
      util.remove_page(page);
      if (key === 'r') {
        pages.begin(pages.make_simple_pages(page_elements));
      } else {
        state.done();
      }
    });
  });
  return state.run();
}

export function run(): Promise<void> {
  state.next(go_fullscreen);
  const page_elements = make_pages();
  return state.run()
    .then(_ => pages.run(pages.make_simple_pages(page_elements)))
    .then(_ => run_confirm(page_elements));
}