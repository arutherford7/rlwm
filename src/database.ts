import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { Database, DatabaseReference, getDatabase, ref, update } from 'firebase/database';
import { random_alpha_numeric_string } from './util';
import { config } from './config';
import * as task from './task';
import * as bonus from './bonus-task';

const firebaseConfig = {
  apiKey: "AIzaSyAc9n98_3EfvFisQLTDD8snRWOsS4W9vpg",
  authDomain: "rlwm-test.firebaseapp.com",
  projectId: "rlwm-test",
  storageBucket: "rlwm-test.appspot.com",
  messagingSenderId: "929708002978",
  appId: "1:929708002978:web:cf61725b82c13bc15d51fb",
  databaseURL: 'https://rlwm-test-default-rtdb.firebaseio.com/',
};

let DB: Database | null = null;
let DB_LEARN_TRIAL_DATA: DatabaseReference | null = null;
let DB_BONUS_TRIAL_DATA: DatabaseReference | null = null;

function get_learn_trial_data_db() {
  return DB_LEARN_TRIAL_DATA;
}

function get_bonus_trial_data_db() {
  return DB_BONUS_TRIAL_DATA;
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

export function push_learn_trial_data(data: {trial_data: task.TrialData, trial_desc: task.TrialDescriptor}) {
  push_data(get_learn_trial_data_db(), data);
}

export function push_bonus_trial_data(data: {trial_data: bonus.TrialData, trial_desc: bonus.TrialDescriptor}) {
  push_data(get_bonus_trial_data_db(), data);
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