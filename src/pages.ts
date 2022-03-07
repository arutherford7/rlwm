import * as state from './state';
import * as util from './util';

type PageDisplay = (element: HTMLDivElement, index: number) => Promise<number>;

export function make_simple_pages(elements: HTMLDivElement[]): PageDisplay[] {
  return elements.map(el => {
    return (element, index) => {
      return new Promise((resolve, _) => {
        element.appendChild(el);
        util.wait_for_space_bar(() => {
          resolve(index + 1);
        });
      });
    }
  });
}

function show_page(pages: PageDisplay[], index: number) {
  if (index >= pages.length) {
    state.done();
  } else {
    const container = util.make_page();
    util.append_page(container);
    pages[index](container, index).then(next_index => {
      util.remove_page(container);
      state.next(() => show_page(pages, next_index));
    });
  }
}

export function begin(pages: PageDisplay[]) {
  state.next(() => show_page(pages, 0));
}

export function run(pages: PageDisplay[]) {
  begin(pages);
  return state.run();
}