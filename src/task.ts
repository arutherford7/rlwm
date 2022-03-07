import * as util from './util'
import * as state from './state'
import { push_trial_data } from './database';

type ImageDescriptor = {
  image_url: string;
  correct_response: string;
  p_large_reward: number,
  image_set: number,
  index: number
};

type ImageStimulus = {
  image_element: HTMLImageElement,
  descriptor: ImageDescriptor
};

export type TrialDescriptor = {
  image_descriptor: ImageDescriptor
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
}

const IMAGES: ImageStimulus[] = [];

export function init_images() {
  const urls = [
    'https://imgur.com/gB0yuuy.png',
    'https://imgur.com/PpFTJzJ.png',
    'https://i.imgur.com/CImnjiA.jpeg',
    'https://i.imgur.com/mHxgmfF.jpeg',
    'https://i.imgur.com/f9qsEWN.jpeg'    
  ];
  
  const p_large_rewards = [0.2, 0.5, 0.8];
  const im_width = 200;
  const im_height = 200;

  for (let i = 0; i < urls.length; i++) {
    const p_large_reward = util.uniform_array_sample(p_large_rewards);
    const desc = make_image_descriptor(urls[i], i, 0, '', p_large_reward);
    IMAGES.push({
      image_element: make_image_element(urls[i], im_width, im_height), 
      descriptor: desc
    });
  }
}

function make_image_element(src: string, pxw: number, pxh: number): HTMLImageElement {
  const image = document.createElement('img');
  image.src = src;
  util.set_pixel_dimensions(image, pxw, pxh);
  return image;
}

function make_image_descriptor(image_url: string, index: number, image_set: number, 
                               correct_response: string, p_large_reward: number): ImageDescriptor {
  return {image_url, correct_response, p_large_reward, image_set, index};
}

function record_response(context: TaskContext, response: string, rt: number) {
  context.trial_data.response = response;
  context.trial_data.rt = rt;
}

function advance(matrix: TrialMatrix): TrialDescriptor {
  return matrix.rows[matrix.index++];
}

function make_task_context(trial_matrix: TrialMatrix, images: ImageStimulus[]): TaskContext {
  const td: TrialData = {rt: -1, response: ''};
  return {trial_data: td, trial_matrix, images};
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

function new_trial_matrix(image_set: ImageStimulus[], num_trials: number): TrialMatrix {
  const rows: TrialDescriptor[] = [];

  for (let i = 0; i < num_trials; i++) {
    const image = util.uniform_array_sample(image_set);
    rows.push({
      image_descriptor: image.descriptor
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
  const num_trials = 12;
  const image_set = new_image_set(IMAGES);
  const trial_matrix = new_trial_matrix(image_set, num_trials);
  const context = make_task_context(trial_matrix, IMAGES);
  state.next(() => present_image_set(() => new_trial(context), image_set));
}

function present_image_set(next: () => void, images: ImageStimulus[]) {
  const page = util.make_page();
  const text = util.make_page();
  text.style.color = 'white';
  text.innerText = 'These are the images for this block. Press Enter to proceed.';

  const image_container = util.make_page();
  image_container.style.flexDirection = 'row';
  for (let i = 0; i < images.length; i++) {
    const el = util.make_page();
    el.appendChild(images[i].image_element);
    image_container.appendChild(el);
  }

  page.appendChild(text);
  page.appendChild(image_container);
  util.append_page(page);
  util.wait_for_key('Enter', () => {
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

  const reward_rand = Math.random();
  const is_big_reward = reward_rand < trial.image_descriptor.p_large_reward;

  const on_correct: ResponseCallback = (key, rt) => {
    state.next(() => success_feedback(context, is_big_reward, rt));
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

function success_feedback(context: TaskContext, is_big_reward: boolean, rt: number) {
  const timeout_ms = 1000;

  const page = util.make_page();
  util.set_pixel_dimensions(page, 100, 100);
  page.style.backgroundColor = is_big_reward ? 'blue' : 'green';
  const reward_text = is_big_reward ? 'Reward 2' : 'Reward 1';
  page.innerText = `${reward_text}. RT was ${rt} ms.`;
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
    state.next(end_block);
  }
}

function end_block() {
  const page = util.make_page();
  util.set_pixel_dimensions(page, 200, 100);
  page.innerText = 'End of block. Press any key to continue to the next block.';
  page.style.color = 'white';
  util.append_page(page);
  util.one_shot_key_listener('keydown', _ => {
    util.remove_page(page);
    state.next(new_block);
  });
}

export function run_task() {
  state.next(initial_instructions);
  state.run();
}