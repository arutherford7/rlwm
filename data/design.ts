export type TestTrialDesign = {
  p_large_rewards: [number, number],
  image_sets: [number, number],
  image_numbers: [number, number],
  correct_options: [number, number]
};

export type DesignMatrix = {
  image_sets: number[],
  image_numbers: Array<number[]>,
  correct_responses: Array<string[]>,
  p_large_rewards: Array<number[]>,
  image_sequences: Array<number[]>,
  num_blocks: number,
  image_set_sizes: number[],
  subject_number: number,
  session_number: number,
  test_trials: TestTrialDesign[]
};

export function find_design_matrix(matrices: DesignMatrix[], subject_index: number, session_index: number): DesignMatrix {
  const target_matrix = matrices.filter(m => m.session_number == session_index+1 && m.subject_number == subject_index+1);
  if (target_matrix.length !== 1) {
    throw new Error(`Expected 1 match for subject ${subject_index} and session ${session_index}; got ${target_matrix.length}`);
  }
  return target_matrix[0];
}

export function get_random_design_matrix(matrices: DesignMatrix[]) {
  if (matrices.length === 0) {
    throw new Error('Empty design matrix array.');
  }

  const subject_indices = matrices.map(m => m.subject_number - 1);
  const session_indices = matrices.map(m => m.session_number - 1);
  const ind = Math.floor(Math.random() * matrices.length);

  return {
    subject_index: subject_indices[ind],
    session_index: session_indices[ind],
    design_matrix: matrices[ind]
  };
}