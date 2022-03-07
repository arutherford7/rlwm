import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { Database, DatabaseReference, getDatabase, ref, update } from 'firebase/database';
import { random_alpha_numeric_string } from './util';
import { TrialData, TrialDescriptor } from './task';

const firebaseConfig = {
  apiKey: "AIzaSyAc9n98_3EfvFisQLTDD8snRWOsS4W9vpg",
  authDomain: "rlwm-test.firebaseapp.com",
  projectId: "rlwm-test",
  storageBucket: "rlwm-test.appspot.com",
  messagingSenderId: "929708002978",
  appId: "1:929708002978:web:cf61725b82c13bc15d51fb",
  databaseURL: 'https://rlwm-test-default-rtdb.firebaseio.com/',
};

const IS_DEBUG = true;
const ENABLE_DB = false;

let DB: Database | null = null;
let DB_TRIAL_DATA: DatabaseReference | null = null;

function get_trial_data_db() {
  return DB_TRIAL_DATA;
}

function uuid_nest(data: object): object {
  return {[random_alpha_numeric_string(16)]: data};
}

export function push_trial_data(data: {trial_data: TrialData, trial_desc: TrialDescriptor}) {
  if (!ENABLE_DB) {
    return;
  }

  const db = get_trial_data_db();
  if (!db) {
    throw new Error('Database access has not been acquired.');
  }

  update(db, uuid_nest(data));
}

export function init_db(on_success: () => void, on_err: (s: string) => void) {
  if (!ENABLE_DB) {
    on_success();
    return;
  }

  const set_db_refs = (uuid: string) => {
    uuid = IS_DEBUG ? 'debug-user' : uuid;
    DB_TRIAL_DATA = ref(DB!, `trial-data/${uuid}`);
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