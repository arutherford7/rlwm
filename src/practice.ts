import * as state from './state';
import * as util from './util';
import { new_image_set, new_trial_matrix } from './task';
import * as learn_block from './learn-block';
import { get_images } from './image';
import { config } from './config';

function new_block() {
  const images = get_images();
  const image_set = new_image_set(images, 0); //  @TODO: Use special index for practice set.
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
  page.innerText = 'End of block 0. [Press spacebar to continue]';
  util.append_page(page);

  util.wait_for_space_bar(() => {
    util.remove_page(page);
    state.done();
  });
}

export function run() {
  state.next(new_block);
  return state.run();
}