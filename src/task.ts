import * as util from './util'
import * as state from './state'

type ImageDescriptor = {
  image_url: string;
  correct_response: string;
  reward: number,
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

const IMAGES: ImageStimulus[] = [];
const TRIAL_MATRIX: TrialBlock = [];
let TRIAL_NUMBER = 0;

function init_images() {
  const urls = [
    'https://imgur.com/gB0yuuy.png',
    'https://imgur.com/PpFTJzJ.png'
  ];
  for (let i = 0; i < urls.length; i++) {
    const desc = make_image_descriptor(urls[i], 0, 'ArrowUp', 1);
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

function make_image_descriptor(image_url: string, image_set: number, correct_response: string, reward: number): ImageDescriptor {
  return {image_url, correct_response, reward, image_set};
}

function init_block() {
  TRIAL_NUMBER = 0;
  TRIAL_MATRIX.splice(0, TRIAL_MATRIX.length);
  
  for (let i = 0; i < 3; i++) {
    const image_index = Math.floor(Math.random() * IMAGES.length);
    TRIAL_MATRIX.push({
      image_element: IMAGES[image_index].image_element, 
      image_descriptor: IMAGES[image_index].descriptor
    });
  }

  state.next(new_trial);
}

function new_trial() {
  const trial = TRIAL_MATRIX[TRIAL_NUMBER++];

  const image_stim: ImageStimulus = {
    image_element: trial.image_element,
    descriptor: trial.image_descriptor
  };

  state.next(() => respond(image_stim));
}

function respond(stim: ImageStimulus) {
  const page = util.make_page();
  util.set_percent_dimensions(page, 50, 50);
  util.append_page(page);
  page.appendChild(stim.image_element);

  const on_correct = () => state.next(() => success_feedback(stim.descriptor));
  const on_incorrect = () => state.next(error_feedback);  

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

function success_feedback(image_desc: ImageDescriptor) {
  const timeout_ms = 1000;

  const page = util.make_page();
  util.set_pixel_dimensions(page, 50, 50);
  page.style.backgroundColor = image_desc.reward == 1 ? 'blue' : 'green';
  util.append_page(page);

  setTimeout(() => {
    util.remove_page(page);
    state.next(end_trial);
  }, timeout_ms);
}

function error_feedback() {
  const timeout_ms = 1000;

  const page = util.make_page();
  util.set_pixel_dimensions(page, 100, 100);
  page.style.backgroundColor = 'red';
  util.append_page(page);

  setTimeout(() => {
    util.remove_page(page);
    state.next(end_trial);
  }, timeout_ms);
}

function end_trial() {
  if (TRIAL_NUMBER < TRIAL_MATRIX.length) {
    state.next(new_trial);
  } else {
    state.next(end_block);
  }
}

function end_block() {
  const page = util.make_page();
  util.set_pixel_dimensions(page, 100, 100);
  page.innerText = 'End of block';
  page.style.color = 'white';
  util.append_page(page);
  util.one_shot_key_listener('keydown', _ => {
    util.remove_page(page);
    state.next(init_block);
  });
}

init_images();

state.next(init_block);
state.run();