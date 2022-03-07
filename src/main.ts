import { init_images } from './image';
import { init_db } from './database'
import * as task from './task'
import * as bonus from './bonus-task';
import * as instructions from './instructions';

init_db(() => {
  init_images();
  instructions.run()
    .then(_ => task.run())
    .then(_ => bonus.run());
}, (err) => {
  console.error('Failed to initialize database: ', err);
});