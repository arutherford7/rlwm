import * as pages from './pages';
import * as util from './util';

export function run() {
  let elements: HTMLDivElement[] = [];

  (() => {
    const page = util.make_text_page();
    page.innerText = `Great! You are almost done with this experiment.
    Press space to continue. `;
    elements.push(page);
  })();

  (() => {
    const page = util.make_text_page();
    page.innerText = `It is time to test what you have learned. During this set of trials you will NOT see the feedback to your responses, but the computer still assigns you points for the image you choose.`;
    elements.push(page);
  })();

  (() => {
    const page = util.make_text_page();
    page.innerText = `You will see two images from the task on the screen at one time: One on the left and the other on the right. Pick the picture that won you the most points during the previous learning task! Remember, you may earn up to $5 in bonus by winning points!`;
    elements.push(page);
  })();

  (() => {
    const page = util.make_text_page();
    page.innerText = `If you are not sure which one to pick, just go with your gut instinct!`;
    elements.push(page);
  })();

  (() => {
    const page = util.make_text_page();
    page.innerText = `To choose the image on the left, hit the "1" key. To choose the image on the right, hit the "0" key.`;
    elements.push(page);
  })();

  return pages.run(pages.make_simple_pages(elements));
}