import { config } from './config'

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

export function wait_for_space_bar(cb: () => void): () => boolean {
  return wait_for_key(' ', cb);
}

export function wait_for_key(key: string, cb: () => void): () => boolean {
  return wait_for_one_of_keys([key], _ => cb());
}

export function wait_for_one_of_keys(keys: string[], cb: (key: string) => void): () => boolean {
  const listener: {value: null | ((e: KeyboardEvent) => void)} = {value: null};

  const abort = () => {
    if (listener.value !== null) {
      window.removeEventListener('keydown', listener.value!);
      listener.value = null;
      return true;
    } else {
      return false;
    }
  }

  listener.value = function(e) {
    let found_key = false;
    let key: string = '';
    for (let i = 0; i < keys.length; i++) {
      if (e.key === keys[i]) {
        key = keys[i];
        found_key = true;
        break;
      }
    }
    if (found_key) {
      abort();
      cb(key);
    }
  }

  window.addEventListener('keydown', listener.value);
  return abort;
}

const BODY = configure_body();
let PAGE_DEPTH = 0;

export function enter_fullscreen(on_success: () => void, on_err: () => void): void {
  BODY.requestFullscreen()
    .then(_ => on_success())
    .catch(_ => on_err());
}

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

export function make_text_page(): HTMLDivElement {
  const page = make_page();
  page.style.color = 'white';
  page.style.width = '800px';
  page.style.fontSize = `${config.instructions_font_size_px}px`;
  return page;
}

export function make_flex_centered_div(w: number, h: number): HTMLDivElement {
  const el = document.createElement('div');
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.width = `${w}px`;
  el.style.height = `${h}px`;
  return el;
}

export function make_p_elements(text: string[]): HTMLParagraphElement[] {
  return text.map(txt => {
    const el = document.createElement('p');
    el.innerText = txt;
    return el;
  });
}

export function append_children<T extends HTMLElement, U extends HTMLElement>(parent: T, elements: U[]): void {
  elements.map(el => parent.appendChild(el));
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

export function permute<T>(a: T[], ind: number[]): T[] {
  const result: T[] = [];
  for (let i = 0; i < ind.length; i++) {
    result.push(a[ind[i]]);
  }
  return result;
}

export function random_alpha_numeric_string(n: number): string {
  const alph = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < n; i++) {
    result += alph[Math.floor(Math.random() * alph.length)];
  }
  return result;
}

export function parse_user_id_from_url(id_param: string, require_id: boolean, missing_url_user_id: string): string {
  const search_params = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(search_params.entries());
  const user_id: string | undefined = params[id_param];
  if (user_id === undefined) {
    if (require_id) {
      throw new Error(`Expected url query parameter "${id_param}" but did not find one, and require_id is true`);
    } else {
      return missing_url_user_id;
    }
  } else {
    if (typeof(user_id) !== 'string') {
      throw new Error('Expected url query parameter to be string.');
    } else {
      return user_id;
    }
  }
}