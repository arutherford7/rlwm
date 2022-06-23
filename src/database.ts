import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { Database, DatabaseReference, getDatabase, ref, update } from 'firebase/database';
import { random_alpha_numeric_string } from './util';
import { config } from './config';
import { DesignMatrix } from '../data/design';
import * as learn_trial from './learn-trial';
import * as bonus from './bonus-task';

export type DesignData = {
  design_matrix: DesignMatrix,
  bonus_trial_matrix: bonus.TrialMatrix,
  subject_index: number,
  session_index: number
};

/*const firebaseConfig = {
  apiKey: "AIzaSyAc9n98_3EfvFisQLTDD8snRWOsS4W9vpg",
  authDomain: "rlwm-test.firebaseapp.com",
  projectId: "rlwm-test",
  storageBucket: "rlwm-test.appspot.com",
  messagingSenderId: "929708002978",
  appId: "1:929708002978:web:cf61725b82c13bc15d51fb",
  databaseURL: 'https://rlwm-test-default-rtdb.firebaseio.com/',
};
*/

const firebaseConfig = {
  apiKey: "AIzaSyDb_sB1uel4nc2na0QazpPtdKqnfv-8vJ8",
  authDomain: "rlwm-a7d24.firebaseapp.com",
  databaseURL: "https://rlwm-a7d24-default-rtdb.firebaseio.com",
  projectId: "rlwm-a7d24",
  storageBucket: "rlwm-a7d24.appspot.com",
  messagingSenderId: "511056477585",
  appId: "1:511056477585:web:f52d4f375871655955ae30",
  measurementId: "G-C2HHHFNJK3"
};

let DB: Database | null = null;
let DB_LEARN_TRIAL_DATA: DatabaseReference | null = null;
let DB_BONUS_TRIAL_DATA: DatabaseReference | null = null;
let DB_DESIGN: DatabaseReference | null = null;

function get_learn_trial_data_db() {
  return DB_LEARN_TRIAL_DATA;
}

function get_bonus_trial_data_db() {
  return DB_BONUS_TRIAL_DATA;
}

function get_design_db() {
  return DB_DESIGN;
}

function uuid_nest(data: object): object {
  return {[random_alpha_numeric_string(16)]: data};
}

function push_data<T extends object>(db: DatabaseReference | null, data: T) {
  if (!config.enable_db) {
    return;
  }

  if (!db) {
    throw new Error('Database access has not been acquired.');
  }

  update(db, uuid_nest(data));
}

export function push_learn_trial_data(data: {trial_data: learn_trial.Result, trial_desc: learn_trial.TrialDescriptor}) {
  push_data(get_learn_trial_data_db(), data);
}

export function push_bonus_trial_data(data: {trial_data: bonus.TrialData, trial_desc: bonus.TrialDescriptor}) {
  push_data(get_bonus_trial_data_db(), data);
}

export function push_design(data: DesignData) {
  push_data(get_design_db(), data);
}

export function make_design_data(dm: DesignMatrix, bonus_trial_matrix: bonus.TrialMatrix, 
                                 subject_index: number, session_index: number): DesignData {
  return {design_matrix: dm, bonus_trial_matrix, subject_index, session_index};
}

export function init_db(on_success: () => void, on_err: (s: string) => void) {
  if (!config.enable_db) {
    on_success();
    return;
  }

  const set_db_refs = (uuid: string) => {
    uuid = config.is_debug_db_user ? 'debug-user' : uuid;
    DB_LEARN_TRIAL_DATA = ref(DB!, `learn-trial-data/${uuid}`);
    DB_BONUS_TRIAL_DATA = ref(DB!, `bonus-trial-data/${uuid}`);
    DB_DESIGN = ref(DB!, `design-matrix/${uuid}`);
  };

  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth();

    DB = getDatabase(app);

    signInAnonymously(auth)
      .then(_ => {
        onAuthStateChanged(auth, user => {
          if (user) {
            set_db_refs(user.uid);
            on_success();
          }
        });
      })
      .catch(err => {
        on_err('Failed to sign in: ' + err.message);
      });
  } catch (err: any) {
    on_err(err.message);
  }
}