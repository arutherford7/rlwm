import * as state from './state';
import * as util from './util';
import { ImageDescriptor, ImageStimulus } from './image';

export type TrialDescriptor = {
  image_descriptor: ImageDescriptor,
  trial_index: number,
  block_index: number,
  possible_reward: number
}

export type Params = {
  stimulus: ImageStimulus
  trial_desc: TrialDescriptor,
  on_complete: (data: Result, trial_desc: TrialDescriptor) => void
}

export type Result = {
  rt: number,
  response: string,
  correct: boolean,
  awarded: number
}

type Context = {
  params: Params,
  result: Result
}

type ResponseCallback = (key: string, rt: number) => void;

const FEEDBACK_MS = 1000;
const RESPONSE_WINDOW_MS = 1400;
const DEBUG_DISPLAY = false;
const FEEDBACK_FONT_SIZE = 30;

function record_response(result: Result, response: string, rt: number, correct: boolean, awarded: number) {
  result.response = response;
  result.rt = rt;
  result.correct = correct;
  result.awarded = awarded
}

function make_result(rt: number, response: string, correct: boolean, awarded: number): Result {
  return {rt, response, correct, awarded};
}

export function trial(params: Params) {
  const context: Context = {params, result: make_result(-1, '', false, -1)};

  const on_correct: ResponseCallback = (key, rt) => {
    state.next(() => success_feedback(context, rt));
    const awarded = params.trial_desc.possible_reward;
    record_response(context.result, key, rt, true, awarded);
  }

  const on_incorrect: ResponseCallback = (key, rt) => {
    state.next(() => error_feedback(context, rt));
    record_response(context.result, key, rt, false, 0);
  }

  state.next(() => respond(on_correct, on_incorrect, params.stimulus));
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
  }, RESPONSE_WINDOW_MS);
}

function success_feedback(context: Context, rt: number) {
  const trial = context.params.trial_desc;
  const is_big_reward = trial.possible_reward == 2;

  const page = util.make_page();
  util.set_pixel_dimensions(page, 100, 100);

  if (DEBUG_DISPLAY) {
    page.style.backgroundColor = is_big_reward ? 'blue' : 'green';
    page.innerText = `Reward ${trial.possible_reward}. RT was ${rt} ms.`;
  } else {
    page.innerText = `+${trial.possible_reward}`;
    page.style.color = is_big_reward ? 'blue' : 'green';
    page.style.fontSize = `${FEEDBACK_FONT_SIZE}px`;
  }
  util.append_page(page);

  setTimeout(() => {
    util.remove_page(page);
    state.next(() => end_trial(context));
  }, FEEDBACK_MS);
}

function error_feedback(context: Context, rt: number) {
  const stim = context.params.stimulus;

  const page = util.make_page();
  util.set_pixel_dimensions(page, 200, 200);

  if (DEBUG_DISPLAY) {
    page.style.backgroundColor = 'red';
    page.innerText = `Incorrect (was ${stim.descriptor.correct_response}). RT was ${rt} ms.`;
  } else {
    page.innerText = '0';
    page.style.color = 'red';
    page.style.fontSize = `${FEEDBACK_FONT_SIZE}px`;
  }
  util.append_page(page);

  setTimeout(() => {
    util.remove_page(page);
    state.next(() => end_trial(context));
  }, FEEDBACK_MS);
}

function end_trial(context: Context) {
  context.params.on_complete(context.result, context.params.trial_desc);
}