import * as util from './util'
import * as state from './state'
import { push_trial_data } from './database';
import { ImageDescriptor, ImageStimulus, get_images } from './image'

export type TrialDescriptor = {
  image_descriptor: ImageDescriptor,
  trial_index: number,
  block_index: number,
  possible_reward: number
}

type TrialMatrix = {
  rows: TrialDescriptor[],
  index: number
}

export type TrialData = {
  rt: number,
  response: string
}

type TaskContext = {
  trial_matrix: TrialMatrix
  trial_data: TrialData,
  images: ImageStimulus[],
  block: number
}

let BLOCK = 0;
let TRIALS_PER_BLOCK = 12;

function record_response(context: TaskContext, response: string, rt: number) {
  context.trial_data.response = response;
  context.trial_data.rt = rt;
}

function advance(matrix: TrialMatrix): TrialDescriptor {
  return matrix.rows[matrix.index++];
}

function make_task_context(block: number, trial_matrix: TrialMatrix, images: ImageStimulus[]): TaskContext {
  const td: TrialData = {rt: -1, response: ''};
  return {trial_data: td, trial_matrix, images, block};
}

function new_image_set(images: ImageStimulus[]): ImageStimulus[] {
  const result: ImageStimulus[] = [];

  const image_set_sizes = [2, 3, 4, 5];
  const correct_keys = ['c', 'v', 'b'];
  const image_set_size = util.uniform_array_sample(image_set_sizes);

  const image_set_perm = util.randperm(images.length);
  for (let i = 0; i < image_set_size; i++) {
    const image_info = images[image_set_perm[i]];
    image_info.descriptor.correct_response = util.uniform_array_sample(correct_keys);
    result.push(image_info);
  }

  return result;
}

function new_trial_matrix(block_index: number, image_set: ImageStimulus[], num_trials: number): TrialMatrix {
  const rows: TrialDescriptor[] = [];

  for (let i = 0; i < num_trials; i++) {
    const image = util.uniform_array_sample(image_set);

    const reward_rand = Math.random();
    const is_big_reward = reward_rand < image.descriptor.p_large_reward;
    const reward = is_big_reward ? 2 : 1;

    rows.push({
      image_descriptor: image.descriptor,
      trial_index: i,
      block_index,
      possible_reward: reward
    });
  }

  return {rows, index: 0};
}

function initial_instructions() {
  const page = util.make_page();

  const text = util.make_page();
  text.style.color = 'white';
  text.innerText = 'These are example instructions.';

  const next_button = document.createElement('button');
  next_button.innerText = 'Click next';
  next_button.onclick = () => {
    util.remove_page(page)
    state.next(go_fullscreen);
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
      state.next(new_block);
    }, () => {
      // try again.
      util.remove_page(page);
      state.next(go_fullscreen);
    });
  }

  page.appendChild(button);
  util.append_page(page);
}

function new_block() {
  const block_index = BLOCK++;
  const images = get_images();
  const num_trials = TRIALS_PER_BLOCK;
  const image_set = new_image_set(images);
  const trial_matrix = new_trial_matrix(block_index, image_set, num_trials);
  const context = make_task_context(block_index, trial_matrix, images);
  state.next(() => present_image_set(context, () => new_trial(context), image_set));
}

function present_image_set(context: TaskContext, next: () => void, images: ImageStimulus[]) {
  const page = util.make_page();
  util.set_percent_dimensions(page, 75, 75);

  const text = util.make_page();
  util.set_percent_dimensions(text, 75, 10);
  text.style.color = 'white';
  text.innerText = `These are the images for block ${context.block+1}. Press Space to proceed.`;

  const image_container = util.make_page();
  image_container.style.flexDirection = 'row';
  util.set_percent_dimensions(image_container, 75, 50);
  for (let i = 0; i < images.length; i++) {
    const el = util.make_page();
    util.set_percent_dimensions(el, 25, 100);
    el.appendChild(images[i].image_element);
    image_container.appendChild(el);
  }

  page.appendChild(text);
  page.appendChild(image_container);
  util.append_page(page);
  util.wait_for_space_bar(() => {
    util.remove_page(page);
    state.next(next);
  });
}

type ResponseCallback = (key: string, rt: number) => void;

function new_trial(context: TaskContext) {
  const trial = advance(context.trial_matrix);
  const image_stim: ImageStimulus = {
    image_element: context.images[trial.image_descriptor.index].image_element,
    descriptor: trial.image_descriptor
  };

  const on_correct: ResponseCallback = (key, rt) => {
    state.next(() => success_feedback(context, trial, rt));
    record_response(context, key, rt);
  }

  const on_incorrect: ResponseCallback = (key, rt) => {
    state.next(() => error_feedback(context, image_stim, rt));
    record_response(context, key, rt);
  }

  state.next(() => respond(on_correct, on_incorrect, image_stim));
}

function respond(on_correct: ResponseCallback, on_incorrect: ResponseCallback, stim: ImageStimulus) {
  const page = util.make_page();
  util.set_percent_dimensions(page, 50, 50);
  util.append_page(page);
  page.appendChild(stim.image_element);

  const begin = performance.now();
  const abort = util.one_shot_key_listener('keydown', e => {
    const now = performance.now();
    if (e.key === stim.descriptor.correct_response) {
      util.remove_page(page);
      on_correct(e.key, now - begin);
    } else {
      util.remove_page(page);
      on_incorrect(e.key, now - begin);
    }
  });

  setTimeout(() => {
    if (abort()) {
      util.remove_page(page);
      on_incorrect('', -1);
    }
  }, 1000)
}

function success_feedback(context: TaskContext, trial: TrialDescriptor, rt: number) {
  const timeout_ms = 1000;
  const is_big_reward = trial.possible_reward == 2;

  const page = util.make_page();
  util.set_pixel_dimensions(page, 100, 100);

  page.style.backgroundColor = is_big_reward ? 'blue' : 'green';
  page.innerText = `Reward ${trial.possible_reward}. RT was ${rt} ms.`;
  util.append_page(page);

  setTimeout(() => {
    util.remove_page(page);
    state.next(() => end_trial(context));
  }, timeout_ms);
}

function error_feedback(context: TaskContext, stim: ImageStimulus, rt: number) {
  const timeout_ms = 1000;

  const page = util.make_page();
  util.set_pixel_dimensions(page, 200, 200);
  page.style.backgroundColor = 'red';
  page.innerText = `Incorrect (was ${stim.descriptor.correct_response}). RT was ${rt} ms.`;
  util.append_page(page);

  setTimeout(() => {
    util.remove_page(page);
    state.next(() => end_trial(context));
  }, timeout_ms);
}

function end_trial(context: TaskContext) {
  push_trial_data({
    trial_data: context.trial_data, 
    trial_desc: context.trial_matrix.rows[context.trial_matrix.index-1]
  });

  if (context.trial_matrix.index < context.trial_matrix.rows.length) {
    state.next(() => new_trial(context));
  } else {
    state.next(() => end_block(context));
  }
}

function end_block(context: TaskContext) {
  const page = util.make_page();
  util.set_pixel_dimensions(page, 400, 100);
  page.innerText = `End of block ${context.block + 1}. Press Space to continue to the next block.`;
  page.style.color = 'white';
  util.append_page(page);
  util.wait_for_space_bar(() => {
    util.remove_page(page);
    state.next(new_block);
  });
}

export function run_task() {
  state.next(initial_instructions);
  state.run();
}