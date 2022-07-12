import { init_images } from './image';
import * as db from './database'
import * as task from './task'
import * as practice from './practice';
import * as bonus_instructions from './bonus-instructions';
import * as bonus from './bonus-task';
import * as instructions from './instructions';
import * as debrief from './debrief';
import * as util from './util';
import { DESIGN_MATRICES } from '../data/designs0';
import { get_random_design_matrix } from '../data/design';
import { config } from './config';

function init_design() {
  const design_info = get_random_design_matrix(DESIGN_MATRICES);
  const main_design_matrix = design_info.design_matrix;
  // const main_design_matrix = find_design_matrix(DESIGN_MATRICES, 0, 1);
  const bonus_trial_matrix = bonus.make_trial_matrix_from_design_matrix(main_design_matrix);

  const design_data = db.make_design_data(
    design_info.design_matrix, 
    bonus_trial_matrix, 
    design_info.subject_index, 
    design_info.session_index);
  db.push_design(design_data);

  return {design_matrix: main_design_matrix, bonus_trial_matrix};
}

function init_meta_data() {
  const param_name = config.qualtrics_user_id_url_param_name;
  const user_id = util.parse_user_id_from_url(param_name, config.require_url_user_id, config.missing_url_user_id);
  const date = (new Date()).toString();

  if (config.debug) {
    console.log('Date: ', date, ' | Qualtrics user id: ', user_id);
  }

  db.push_meta_data({qualtrics_user_id: user_id, date});
}

db.init_db(() => {
  init_images();
  init_meta_data();
  const {design_matrix, bonus_trial_matrix} = init_design();

  (new Promise((resolve, _) => resolve(null)))
    .then(_ => instructions.run())
    .then(_ => practice.run())
    .then(_ => task.run(design_matrix))
    .then(_ => bonus_instructions.run())
    .then(_ => bonus.run({trial_matrix: bonus_trial_matrix}))
    .then(_ => debrief.run())
    .then(_ => {
      console.log('Task finished.');
    });
}, (err) => {
  console.error('Failed to initialize database: ', err);
});