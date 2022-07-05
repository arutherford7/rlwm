import * as learn_trial from './learn-trial';
import * as util from './util';
import * as state from './state';
import { ImageStimulus } from './image';

type TrialMatrix = {
  rows: learn_trial.TrialDescriptor[],
  index: number,
};

type Context = {
  params: Params
  trial_matrix: TrialMatrix
}

export type Params = {
  font_size_px: number,
  trials: learn_trial.TrialDescriptor[],
  image_set: ImageStimulus[],
  all_images: ImageStimulus[],
  present_image_set: boolean,
  on_trial_complete: (result: learn_trial.Result, trial_desc: learn_trial.TrialDescriptor) => boolean,
  on_complete: () => void
};

function advance(matrix: TrialMatrix): learn_trial.TrialDescriptor {
  return matrix.rows[matrix.index++];
}

export function run(params: Params) {
  const context: Context = {params, trial_matrix: {rows: params.trials, index: 0}};
  const first_trial = () => new_trial(context);
  if (params.present_image_set) {
    state.next(() => present_image_set(context, first_trial));
  } else {
    state.next(first_trial);
  }
}

function present_image_set(context: Context, next: () => void) {
  const page = util.make_page();
  util.set_percent_dimensions(page, 75, 75);

  const text = util.make_page();
  util.set_percent_dimensions(text, 75, 10);
  text.style.color = 'white';
  text.style.fontSize = `${context.params.font_size_px}px`;
  text.innerText = `Take some time to identify the images for this block.
  [Press spacebar to continue.]`;

  const image_container = util.make_page();
  image_container.style.flexDirection = 'row';
  util.set_percent_dimensions(image_container, 75, 50);
  for (let i = 0; i < context.params.image_set.length; i++) {
    const el = util.make_page();
    util.set_percent_dimensions(el, 25, 100);
    el.appendChild(context.params.image_set[i].image_element);
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

function new_trial(context: Context) {
  const trial = advance(context.trial_matrix);

  const image_stim: ImageStimulus = {
    image_element: context.params.all_images[trial.image_descriptor.index].image_element,
    descriptor: trial.image_descriptor
  };

  const params: learn_trial.Params = {
    stimulus: image_stim,
    trial_desc: trial,
    on_complete: (result, trial_desc) => {
      const proceed = context.params.on_trial_complete(result, trial_desc);
      if (proceed && context.trial_matrix.index < context.trial_matrix.rows.length) {
        state.next(() => new_trial(context));
      } else {
        context.params.on_complete();
      }
    }
  }

  state.next(() => learn_trial.trial(params));
}