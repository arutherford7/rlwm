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

export function get_images(): ImageStimulus[] {
  return IMAGES;
}

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