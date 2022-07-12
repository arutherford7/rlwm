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
    util.append_children(page, util.make_p_elements('Welcome to the memory game.\nPress SPACEBAR to begin instructions.'.split('\n')));
    disp.push(page);
  })();
  (() => {
    const page = util.make_text_page();
    const txt = `In this experiment, you will see an image on the screen. You need to respond to each image by pressing one of the three buttons on the keyboard, C, V or B, with your dominant hand.\nPress SPACEBAR to go through the instructions.`.split('\n');
    util.append_children(page, util.make_p_elements(txt));
    disp.push(page);
  })();
  (() => {
    const page = util.make_text_page();
    const txt = `Your goal is to figure out which button makes you win for each image. You will have a few seconds to respond. Please respond to every image as quickly and accurately as possible. If you do not respond, the trial will be counted as a loss.\nPress SPACEBAR to go through the instructions.`.split('\n');
    util.append_children(page, util.make_p_elements(txt));
    disp.push(page);
  })();
  (() => {
    const page = util.make_text_page();
    const txt = `If you select the correct button, you will gain points. You can gain either 1 or 2 points. The computer assigns points randomly, but only if you selected the correct button! You may receive a bonus of up to $5 monetary reward, based on how many points you win!\nPress SPACEBAR to go through the instructions.`.split('\n');
    util.append_children(page, util.make_p_elements(txt));
    disp.push(page);
  })();
  (() => {
    const page = util.make_text_page();
    const txt = `After the practice section, there will be 12 short blocks. You can rest between each block. At the beginning of each block, you will be shown the set of images for that block. Take some time to identify them correctly.\nPress SPACEBAR to go through the instructions.`.split('\n');
    util.append_children(page, util.make_p_elements(txt));
    disp.push(page);
  })();
  (() => {
    const page = util.make_text_page();
    const txt: string[] = [];
    txt.push(`Note the following important rules: 
    1. There is ONLY ONE correct response for each image. 
    2. One response button MAY be correct for multiple images, or not be correct for any image. 
    3. Within each block, the correct response for each image will not change. 
    4. The more correct responses you give, the faster you will finish the block.`);
    txt.push('Press SPACEBAR to go through the instructions.');
    util.append_children(page, util.make_p_elements(txt));
    disp.push(page);
  })();

  return disp;
}

function run_confirm(page_elements: HTMLDivElement[]) {  
  state.next(() => {
    const page = util.make_text_page();
    page.innerText = `Press R to read the instructions again. Press a key to begin practice.`;
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

function run_key_reminder() {
  state.next(() => {
    const page = util.make_text_page();
    page.innerText = `Please now place three fingers from your dominant hand on the letters "C, V, and B" on your keyboard before beginning.`;
    util.append_page(page);
    util.wait_for_space_bar(() => {
      util.remove_page(page);
      state.done();
    });
  });
  return state.run();
}

export function run(): Promise<void> {
  state.next(go_fullscreen);
  const page_elements = make_pages();
  return state.run()
    .then(_ => pages.run(pages.make_simple_pages(page_elements)))
    .then(_ => run_confirm(page_elements)
    .then(_ => run_key_reminder()));
}