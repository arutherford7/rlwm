import { init_images } from './image';
import { init_db } from './database'
import * as task from './task'
import * as practice from './practice';
import * as bonus_instructions from './bonus-instructions';
import * as bonus from './bonus-task';
import * as instructions from './instructions';
import * as debrief from './debrief';
import { DESIGN_MATRICES } from '../data/designs0';
import { find_design_matrix } from '../data/design';

init_db(() => {
  init_images();
  
  const main_design_matrix = find_design_matrix(DESIGN_MATRICES, 0, 1);
  const bonus_trial_matrix = bonus.make_trial_matrix_from_design_matrix(main_design_matrix);

  instructions.run()
    .then(_ => practice.run())
    .then(_ => task.run(main_design_matrix))
    .then(_ => bonus_instructions.run())
    .then(_ => bonus.run({trial_matrix: bonus_trial_matrix}))
    .then(_ => debrief.run())
    .then(_ => {
      console.log('Task finished.');
    });
}, (err) => {
  console.error('Failed to initialize database: ', err);
});