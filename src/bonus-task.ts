import * as util from './util'
import * as state from './state'
import { ImageDescriptor, get_images } from './image';
import { push_bonus_trial_data } from './database';
import { config } from './config';

export type TrialDescriptor = {
  left_image: ImageDescriptor,
  right_image: ImageDescriptor,
  trial_index: number
};

type TrialMatrix = {
  rows: TrialDescriptor[],
  index: number
};

export type TrialData = {
  response: string
};

type TaskContext = {
  trial_matrix: TrialMatrix;
  trial_data: TrialData;
}

function make_trial_data(response: string): TrialData {
  return {response};
}

function make_task_context(matrix: TrialMatrix): TaskContext {
  return {trial_matrix: matrix, trial_data: make_trial_data('')};
}

function record_response(context: TaskContext, response: string) {
  context.trial_data.response = response;
}

function make_trial_matrix(num_trials: number): TrialMatrix {
  const images = get_images();
  if (images.length < 2) {
    throw new Error('Not enough images.');
  }

  const rows: TrialDescriptor[] = [];
  for (let i = 0; i < num_trials; i++) {
    const left_index = Math.floor(Math.random() * images.length);
    let right_index = left_index;
    while (right_index === left_index) {
      right_index = Math.floor(Math.random() * images.length);
    }

    rows.push({
      left_image: images[left_index].descriptor,
      right_image: images[right_index].descriptor,
      trial_index: i
    });
  }

  return {rows, index: 0};
}

function advance(matrix: TrialMatrix): TrialDescriptor {
  return matrix.rows[matrix.index++];
}

// function initial_instructions() {
//   const page = util.make_page();
//   page.style.color = 'white';
//   page.innerText = 'Nice work! Welcome to the BONUS ROUND. Press spacebar to continue.';
//   util.append_page(page);

//   util.wait_for_space_bar(() => {
//     util.remove_page(page);
//     state.next(new_block);
//   });
// }

function new_block() {
  const page = util.make_page();
  page.style.color = 'white';
  page.innerText = 'example new block';
  util.append_page(page);

  const trial_matrix = make_trial_matrix(config.num_bonus_trials);
  const context = make_task_context(trial_matrix);

  util.wait_for_space_bar(() => {
    util.remove_page(page);
    state.next(() => new_trial(context));
  });
}

function new_trial(context: TaskContext) {
  const trial = advance(context.trial_matrix);
  const images = get_images();
  const im0 = images[trial.left_image.index].image_element;
  const im1 = images[trial.right_image.index].image_element;
  respond(im0, im1, e => {
    record_response(context, e.key);
    state.next(() => end_trial(context));
  });
}

function respond(im0: HTMLImageElement, im1: HTMLImageElement, on_press: (e: KeyboardEvent) => void) {
  const page = util.make_page();
  const im_container = util.make_page();
  im_container.style.flexDirection = 'row';
  im_container.appendChild(im0);
  im_container.appendChild(im1);
  page.appendChild(im_container);
  util.append_page(page);
  util.one_shot_key_listener('keydown', e => {
    util.remove_page(page);
    on_press(e);
  });
}

function end_trial(context: TaskContext) {
  push_bonus_trial_data({
    trial_data: context.trial_data,
    trial_desc: context.trial_matrix.rows[context.trial_matrix.index-1]
  });

  const trial_matrix = context.trial_matrix;
  if (trial_matrix.index < trial_matrix.rows.length) {
    state.next(() => new_trial(context));
  } else {
    state.done();
  }
}

export function run(): Promise<void> {
  state.next(new_block);
  return state.run();
}