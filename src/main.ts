import { init_images } from './image';
import { run_task } from './task';
import { init_db } from './database'

init_db(() => {
  init_images();
  run_task();
}, (err) => {
  console.error('Failed to initialize database: ', err);
});