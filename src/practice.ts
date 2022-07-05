import * as state from './state';
import * as util from './util';
import { new_image_set, new_trial_matrix } from './task';
import * as learn_block from './learn-block';
import { get_training_images } from './image';
import { config } from './config';

let TRIAL_HISTORY: boolean[] = [];
let FINISHED_PRACTICE = false;

function practice_finished(): boolean {
  if (TRIAL_HISTORY.length >= config.min_num_practice_trials) {
    let num_correct = 0;
    for (let i = TRIAL_HISTORY.length - config.min_num_practice_trials; i < TRIAL_HISTORY.length; i++) {
      num_correct += TRIAL_HISTORY[i] ? 1 : 0;
    }
    if (num_correct / config.min_num_practice_trials >= config.practice_correct_threshold || 
        TRIAL_HISTORY.length >= config.max_num_practice_trials) {
      return true;
    }
  }
  return false;
}

function new_block() {
  const images = get_training_images();
  const image_set = new_image_set(images, 0);
  const trial_matrix = new_trial_matrix(0, image_set, config.min_num_practice_trials);

  const params: learn_block.Params = {
    font_size_px: config.instructions_font_size_px,
    trials: trial_matrix,
    image_set: image_set,
    all_images: images,
    present_image_set: TRIAL_HISTORY.length === 0,  //  only present image set on first trial
    on_trial_complete: (result, _) => {
      TRIAL_HISTORY.push(result.correct);
      if (practice_finished()) {
        FINISHED_PRACTICE = true;
        return false; //  don't proceed
      } else {
        return true;
      }
    },
    on_complete: () => state.next(debrief)
  }
  
  state.next(() => learn_block.run(params));
}

function debrief() {
  if (FINISHED_PRACTICE) {
    const page = util.make_page();
    page.style.color = 'white';
    page.style.fontSize = `${config.instructions_font_size_px}px`;
    page.innerText = 'End of block 0. [Press spacebar to continue]';
    util.append_page(page);

    util.wait_for_space_bar(() => {
      util.remove_page(page);
      state.done();
    });
  } else {
    state.next(new_block);
  }
}

export function run() {
  TRIAL_HISTORY.splice(0, TRIAL_HISTORY.length);
  FINISHED_PRACTICE = false;
  state.next(new_block);
  return state.run();
}