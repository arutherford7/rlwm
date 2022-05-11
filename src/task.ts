import * as util from './util'
import * as state from './state'
import * as learn_trial from './learn-trial';
import * as learn_block from './learn-block';
import { config } from './config';
import { push_learn_trial_data } from './database';
import { ImageStimulus, get_images, get_num_sets } from './image'

let BLOCK = 0;
let BLOCK_IMAGE_PERMUTATION: number[] = [];

export function new_image_set(images: ImageStimulus[], image_set_index: number): ImageStimulus[] {
  const result: ImageStimulus[] = [];

  const image_set_sizes = [2, 3, 4, 5];
  const correct_keys = ['c', 'v', 'b'];
  const image_set_size = util.uniform_array_sample(image_set_sizes);

  let image_subset = images.filter(im => im.descriptor.image_set === image_set_index);
  if (image_subset.length === 0) {
    console.error(`No images matched ${image_set_index}`);
    image_subset = images;
  }

  const image_set_perm = util.randperm(image_subset.length);
  for (let i = 0; i < Math.min(image_set_size, image_subset.length); i++) {
    const image_info = image_subset[image_set_perm[i]];
    image_info.descriptor.correct_response = util.uniform_array_sample(correct_keys);
    result.push(image_info);
  }

  return result;
}

export function new_trial_matrix(block_index: number, image_set: ImageStimulus[], num_trials: number): learn_trial.TrialDescriptor[] {
  const rows: learn_trial.TrialDescriptor[] = [];

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

  return rows;
}

function init_block_image_permutation() {
  if (config.randomize_image_set_order) {
    const order = util.randperm(get_num_sets());
    let n = config.num_learn_blocks;
    if (order.length < n) {
      console.error(`Cannot request ${config.num_learn_blocks} blocks because there are only ${order.length} image sets.`);
      n = order.length;
    }

    BLOCK_IMAGE_PERMUTATION = new Array(n);
    for (let i = 0; i < n; i++) {
      BLOCK_IMAGE_PERMUTATION[i] = order[i];
    }
  } else {
    BLOCK_IMAGE_PERMUTATION = util.iota(config.num_learn_blocks, 0);
  }
}

function new_block() {
  const block_index = BLOCK++;
  if (block_index === 0) {
    init_block_image_permutation();
  }

  let image_set_index: number;
  if (block_index >= BLOCK_IMAGE_PERMUTATION.length) {
    console.error(`Out of bounds image set index: ${block_index}.`);
    image_set_index = 0;
  } else {
    image_set_index = BLOCK_IMAGE_PERMUTATION[block_index];
  }

  const images = get_images();
  const num_trials = config.num_trials_per_learn_block;
  const image_set = new_image_set(images, image_set_index);
  const trial_matrix = new_trial_matrix(block_index, image_set, num_trials);

  const params: learn_block.Params = {
    trials: trial_matrix,
    image_set: image_set,
    all_images: images,
    on_trial_complete: (result, trial_desc) => {
      push_learn_trial_data({
        trial_data: result,
        trial_desc: trial_desc
      });
    },
    on_complete: () => state.next(end_block)
  }

  state.next(() => learn_block.run(params));
}

function end_block() {
  if (BLOCK < config.num_learn_blocks) {
    const page = util.make_page();
    util.set_pixel_dimensions(page, 400, 100);
    page.style.color = 'white';
    page.innerText = `End of block ${BLOCK}. You may press the spacebar whenever you are ready to begin the next block.`;
    util.append_page(page);
    util.wait_for_space_bar(() => {
      util.remove_page(page);
      state.next(new_block);
    });
  } else {
    state.done();
  }
}

export function run(): Promise<void> {
  state.next(new_block);
  return state.run();
}