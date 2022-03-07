import * as state from './state';
import * as util from './util';
import { new_image_set, new_trial_matrix } from './task';
import * as learn_block from './learn-block';
import { get_images } from './image';
import { config } from './config';

function new_block() {
  const images = get_images();
  const image_set = new_image_set(images);
  const trial_matrix = new_trial_matrix(0, image_set, config.num_practice_trials);

  const params: learn_block.Params = {
    trials: trial_matrix,
    image_set: image_set,
    all_images: images,
    on_trial_complete: (result, trial_desc) => {},
    on_complete: () => state.next(debrief)
  }
  
  state.next(() => learn_block.run(params));
}

function debrief() {
  const page = util.make_page();
  page.style.color = 'white';
  page.innerText = 'You are now ready to begin the experiment. You may press the spacebar to begin. Press R to repeat the practice round.';
  util.append_page(page);

  util.wait_for_one_of_keys([' ', 'r'], key => {
    util.remove_page(page);
    if (key === ' ') {
      state.done();
    } else {
      state.next(new_block);
    }
  });
}

export function run() {
  state.next(new_block);
  return state.run();
}