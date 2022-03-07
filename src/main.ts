import { init_images } from './image';
import { init_db } from './database'
import * as task from './task'
import * as practice from './practice';
import * as bonus_instructions from './bonus-instructions';
import * as bonus from './bonus-task';
import * as instructions from './instructions';
import * as debrief from './debrief';

init_db(() => {
  init_images();
  instructions.run()
    .then(_ => practice.run())
    .then(_ => task.run())
    .then(_ => bonus_instructions.run())
    .then(_ => bonus.run())
    .then(_ => debrief.run())
    .then(_ => {
      console.log('Task finished.');
    });
}, (err) => {
  console.error('Failed to initialize database: ', err);
});