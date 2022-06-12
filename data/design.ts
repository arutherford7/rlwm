export type DesignMatrix = {
    image_sets: number[],
    image_numbers: Array<number[]>
    correct_responses: Array<string[]>,
    p_large_rewards: Array<number[]>,
    image_sequences: Array<number[]>,
    num_blocks: number,
    image_set_sizes: number[],
    subject_number: number,
    session_number: number
};