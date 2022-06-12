import * as util from './util';

export type ImageDescriptor = {
  image_url: string;
  correct_response: string;
  p_large_reward: number,
  image_set: number,
  image_number: number,
  index: number
};

export type ImageStimulus = {
  image_element: HTMLImageElement,
  descriptor: ImageDescriptor
};

const IMAGES: ImageStimulus[] = [];
const TRAINING_IMAGES: ImageStimulus[] = [];

type ImageSetInfo = {
  urls: string[],
  set_indices: number[],
  image_indices: number[],
  image_numbers: number[]
}

function generate_image_set_info(num_sets: number, images_per_set: number): ImageSetInfo {
  const urls = [];
  const set_indices = [];
  const image_indices = [];
  const image_numbers = [];

  let index_offset = 0;
  for (let i = 0; i < num_sets; i++) {
    for (let j = 0; j < images_per_set; j++) {
      urls.push(`img/images${i+1}/image${j+1}.bmp`);
      set_indices.push(i);
      image_indices.push(index_offset);
      image_numbers.push(j);
      index_offset++;
    }
  }
  return {urls, set_indices, image_indices, image_numbers}
}

function generate_training_image_set_info(): ImageSetInfo {
  const urls = ['img/training/inv-Slide1.png', 'img/training/inv-Slide2.png'];
  const set_indices = [0, 0];
  const image_indices = [0, 1];
  const image_numbers = [0, 1];
  return {urls, set_indices, image_indices, image_numbers}
}

function generate_debug_image_set_info(): ImageSetInfo {
  const urls = [
    'https://imgur.com/gB0yuuy.png',
    'https://imgur.com/PpFTJzJ.png',
    'https://i.imgur.com/CImnjiA.jpeg',
    'https://i.imgur.com/mHxgmfF.jpeg',
    'https://i.imgur.com/f9qsEWN.jpeg'    
  ];
  const set_indices = [];
  const image_indices = [];
  const image_numbers = [];
  for (let i = 0; i < urls.length; i++) {
    set_indices.push(0);
    image_indices.push(i);
    image_numbers.push(i);
  }
  return {urls, set_indices, image_indices, image_numbers};
}

export function get_images(): ImageStimulus[] {
  return IMAGES;
}

export function get_num_sets(): number {
  const set: Set<number> = new Set();
  for (let i = 0; i < IMAGES.length; i++) {
    set.add(IMAGES[i].descriptor.image_set); 
  }
  return set.size;
}

export function get_training_images(): ImageStimulus[] {
  return TRAINING_IMAGES;
}

function to_image_stimuli(info: ImageSetInfo, p_large_rewards: number[], im_width: number, im_height: number): ImageStimulus[] {
  const result: ImageStimulus[] = [];
  for (let i = 0; i < info.urls.length; i++) {
    const url = info.urls[i];
    const image_set_index = info.set_indices[i];
    const image_index = info.image_indices[i];
    const im_number = info.image_numbers[i];

    const p_large_reward = util.uniform_array_sample(p_large_rewards);
    const desc = make_image_descriptor(url, image_index, image_set_index, im_number, '', p_large_reward);
    result.push({
      image_element: make_image_element(url, im_width, im_height), 
      descriptor: desc
    });
  }
  return result;
}

export function init_images() {
  const num_image_sets = 19;
  const images_per_set = 6;
  const image_set_info = generate_image_set_info(num_image_sets, images_per_set);
  
  const p_large_rewards = [0.2, 0.5, 0.8];
  const im_width = 200;
  const im_height = 200;
  const ims = to_image_stimuli(image_set_info, p_large_rewards, im_width, im_height);
  ims.map(im => IMAGES.push(im));

  const training_set_info = generate_training_image_set_info();
  const training_ims = to_image_stimuli(training_set_info, p_large_rewards, im_width, im_height);
  training_ims.map(im => TRAINING_IMAGES.push(im));
}

function make_image_element(src: string, pxw: number, pxh: number): HTMLImageElement {
  const image = document.createElement('img');
  image.src = src;
  util.set_pixel_dimensions(image, pxw, pxh);
  return image;
}

function make_image_descriptor(image_url: string, index: number, image_set: number, image_number: number,
                               correct_response: string, p_large_reward: number): ImageDescriptor {
  return {image_url, correct_response, p_large_reward, image_set, image_number, index};
}