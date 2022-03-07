import { run_task, init_images } from './task';
import { init_db } from './database'

init_db(() => {
  init_images();
  run_task();
}, (err) => {
  console.error('Failed to initialize database: ', err);
});