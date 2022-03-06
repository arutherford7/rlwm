export function one_shot_key_listener(type: 'keydown' | 'keyup', cb: (e: KeyboardEvent) => void): () => boolean {
  const listener: {value: null | ((e: KeyboardEvent) => void)} = {value: null};

  const abort = () => {
    if (listener.value !== null) {
      window.removeEventListener(type, listener.value!);
      listener.value = null;
      return true;
    } else {
      return false;
    }
  }

  listener.value = function(e) {
    abort();
    cb(e);
  }

  window.addEventListener(type, listener.value);
  return abort;
}

const BODY = configure_body();
let PAGE_DEPTH = 0;

export function append_page(page: HTMLDivElement) {
  if (PAGE_DEPTH !== 0) {
    throw new Error('Call `remove_page()` before appending a new page.');
  }
  BODY.appendChild(page);
  PAGE_DEPTH++;
}

export function remove_page(page: HTMLDivElement) {
  if (PAGE_DEPTH !== 1) {
    throw new Error('Call `append_page()` before removing a page.');
  }
  BODY.removeChild(page);
  PAGE_DEPTH--;
}

export function configure_body(): HTMLBodyElement {
  const body = document.getElementsByTagName('body')[0];
  body.style.width = '100%';
  body.style.height = '100%';
  body.style.margin = '0 0';
  body.style.display = 'flex';
  body.style.flexDirection = 'column';
  body.style.alignItems = 'center';
  body.style.justifyContent = 'center';
  body.style.position = 'fixed';
  body.style.backgroundColor = 'black';
  return body;
}

export function make_page(): HTMLDivElement {
  const page = document.createElement('div');
  page.style.display = 'flex';
  page.style.flexDirection = 'column';
  page.style.alignItems = 'center';
  page.style.justifyContent = 'center';
  return page;
}

export function set_percent_dimensions<T extends HTMLElement>(el: T, w: number, h: number): void {
  el.style.width = `${w}%`;
  el.style.height = `${h}%`
}

export function set_pixel_dimensions<T extends HTMLElement>(el: T, w: number, h: number): void {
  el.style.width = `${w}px`;
  el.style.height = `${h}px`
}

export function uniform_array_sample<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}

export function iota(n: number, init: number): number[] {
  const arr = new Array(n);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = i + init;
  }
  return arr;
}

export function randperm(n: number): number[] {
  const arr = iota(n, 1);
  const result = new Array(n);

  let i = 0;
  while (n > 0) {
    const idx = Math.min(n - 1, Math.floor(Math.random() * n));
    result[i++] = arr[idx] - 1;
    arr[idx] = arr[n - 1];
    n--;
  }

  return result;
}