import * as pages from './pages';
import * as util from './util';

export function run() {
  const page0 = util.make_text_page();
  page0.innerText = 'Nice work! Welcome to the BONUS ROUND!';

  const page1 = util.make_text_page();
  page1.innerText = `In this round, you'll be presented with two pictures from the previous blocks of the task. Your job is to decide which image you think you received the most points for.`;

  return pages.run(pages.make_simple_pages([page0, page1]));
}