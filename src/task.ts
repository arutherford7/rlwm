import * as util from './util'
import * as state from './state'

type ImageDescriptor = {
  image_url: string;
  correct_response: string;
  p_large_reward: number,
  image_set: number
};

type ImageStimulus = {
  image_element: HTMLImageElement,
  descriptor: ImageDescriptor
};

type TrialDescriptor = {
  image_element: HTMLImageElement,
  image_descriptor: ImageDescriptor
}

type TrialBlock = TrialDescriptor[];

type TrialMatrix = {
  rows: TrialBlock,
  index: number
}

function advance(matrix: TrialMatrix): TrialDescriptor {
  return matrix.rows[matrix.index++];
}

const IMAGES: ImageStimulus[] = [];

function init_images() {
  const urls = [
    'https://imgur.com/gB0yuuy.png',
    'https://imgur.com/PpFTJzJ.png',
    'https://imgur.com/gB0yuuy.png',
    'https://imgur.com/PpFTJzJ.png',
    'https://imgur.com/gB0yuuy.png',
    'https://imgur.com/PpFTJzJ.png'
  ];
  
  const p_large_rewards = [0.2, 0.5, 0.8];

  for (let i = 0; i < urls.length; i++) {
    const p_large_reward = util.uniform_array_sample(p_large_rewards);
    const desc = make_image_descriptor(urls[i], 0, '', p_large_reward);
    IMAGES.push({
      image_element: make_image_element(urls[i]), 
      descriptor: desc
    });
  }
}

function make_image_element(src: string): HTMLImageElement {
  const image = document.createElement('img');
  image.src = src;
  return image;
}

function make_image_descriptor(image_url: string, image_set: number, correct_response: string, p_large_reward: number): ImageDescriptor {
  return {image_url, correct_response, p_large_reward, image_set};
}

function new_image_set(images: ImageStimulus[]): ImageStimulus[] {
  const result: ImageStimulus[] = [];

  const image_set_sizes = [2, 3, 4, 5];
  const correct_keys = ['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'];
  const image_set_size = util.uniform_array_sample(image_set_sizes);

  const image_set_perm = util.randperm(images.length);
  const key_perm = util.randperm(correct_keys.length);

  for (let i = 0; i < image_set_size; i++) {
    const image_info = images[image_set_perm[i]];
    image_info.descriptor.correct_response = correct_keys[key_perm[i]];
    result.push(image_info);
  }

  return result;
}

function new_trial_matrix(image_set: ImageStimulus[], num_trials: number): TrialMatrix {
  const rows: TrialDescriptor[] = [];

  for (let i = 0; i < num_trials; i++) {
    const image = util.uniform_array_sample(image_set);
    rows.push({
      image_element: image.image_element, 
      image_descriptor: image.descriptor
    });
  }

  return {rows, index: 0};
}

function new_block() {
  const num_trials = 3;
  const image_set = new_image_set(IMAGES);
  const trial_matrix = new_trial_matrix(image_set, num_trials);
  state.next(() => present_image_set(trial_matrix, image_set));
}

function present_image_set(trial_matrix: TrialMatrix, images: ImageStimulus[]) {
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
  util.one_shot_key_listener('keydown', e => {
    if (e.key === 'Enter') {
      util.remove_page(page);
      state.next(() => new_trial(trial_matrix));
    }
  });
}

function new_trial(trial_matrix: TrialMatrix) {
  const trial = advance(trial_matrix);

  const image_stim: ImageStimulus = {
    image_element: trial.image_element,
    descriptor: trial.image_descriptor
  };

  const reward_rand = Math.random();
  const is_big_reward = reward_rand < trial.image_descriptor.p_large_reward;
  state.next(() => respond(trial_matrix, image_stim, is_big_reward));
}

function respond(trial_matrix: TrialMatrix, stim: ImageStimulus, is_big_reward: boolean) {
  const page = util.make_page();
  util.set_percent_dimensions(page, 50, 50);
  util.append_page(page);
  page.appendChild(stim.image_element);

  const on_correct = () => state.next(() => success_feedback(trial_matrix, is_big_reward));
  const on_incorrect = () => state.next(() => error_feedback(trial_matrix));  

  const abort = util.one_shot_key_listener('keydown', e => {
    if (e.key === stim.descriptor.correct_response) {
      util.remove_page(page);
      on_correct();
    } else {
      util.remove_page(page);
      on_incorrect();
    }
  });

  setTimeout(() => {
    if (abort()) {
      util.remove_page(page);
      on_incorrect();
    }
  }, 1000)
}

function success_feedback(trial_matrix: TrialMatrix, is_big_reward: boolean) {
  const timeout_ms = 1000;

  const page = util.make_page();
  util.set_pixel_dimensions(page, 100, 100);
  page.style.backgroundColor = is_big_reward ? 'blue' : 'green';
  page.innerText = is_big_reward ? 'Reward 2' : 'Reward 1';
  util.append_page(page);

  setTimeout(() => {
    util.remove_page(page);
    state.next(() => end_trial(trial_matrix));
  }, timeout_ms);
}

function error_feedback(trial_matrix: TrialMatrix) {
  const timeout_ms = 1000;

  const page = util.make_page();
  util.set_pixel_dimensions(page, 100, 100);
  page.style.backgroundColor = 'red';
  page.innerText = 'Incorrect';
  util.append_page(page);

  setTimeout(() => {
    util.remove_page(page);
    state.next(() => end_trial(trial_matrix));
  }, timeout_ms);
}

function end_trial(trial_matrix: TrialMatrix) {
  if (trial_matrix.index < trial_matrix.rows.length) {
    state.next(() => new_trial(trial_matrix));
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

init_images();

state.next(new_block);
state.run();