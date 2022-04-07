import * as util from './util';

export type ImageDescriptor = {
  image_url: string;
  correct_response: string;
  p_large_reward: number,
  image_set: number,
  index: number
};

export type ImageStimulus = {
  image_element: HTMLImageElement,
  descriptor: ImageDescriptor
};

const IMAGES: ImageStimulus[] = [];

type ImageSetInfo = {
  urls: string[],
  set_indices: number[],
  image_indices: number[],
}

function generate_image_set_info(num_sets: number, images_per_set: number): ImageSetInfo {
  const urls = [];
  const set_indices = [];
  const image_indices = [];

  for (let i = 0; i < num_sets; i++) {
    for (let j = 0; j < images_per_set; j++) {
      urls.push(`img/images${i+1}/image${j+1}.bmp`);
      set_indices.push(i);
      image_indices.push(j);
    }
  }
  return {urls, set_indices, image_indices}
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
  for (let i = 0; i < urls.length; i++) {
    set_indices.push(0);
    image_indices.push(i);
  }
  return {urls, set_indices, image_indices};
}

export function get_images(): ImageStimulus[] {
  return IMAGES;
}

export function init_images() {
  const num_image_sets = 19;
  const images_per_set = 6;
  const image_set_info = generate_image_set_info(num_image_sets, images_per_set);
  
  const p_large_rewards = [0.2, 0.5, 0.8];
  const im_width = 200;
  const im_height = 200;

  for (let i = 0; i < image_set_info.urls.length; i++) {
    const url = image_set_info.urls[i];
    const image_set_index = image_set_info.set_indices[i];
    const image_index = image_set_info.image_indices[i];

    const p_large_reward = util.uniform_array_sample(p_large_rewards);
    const desc = make_image_descriptor(url, image_index, image_set_index, '', p_large_reward);
    IMAGES.push({
      image_element: make_image_element(url, im_width, im_height), 
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