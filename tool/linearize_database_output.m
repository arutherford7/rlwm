src_p = 'C:\Users\nick\Downloads\0705_rlwm-a7d24-default-rtdb-export.json';
js = jsondecode( fileread(src_p) );

%%

subj_ids = fieldnames( js.learn_trial_data );
tbls = cell( size(subj_ids) );

for i = 1:numel(subj_ids)

subj_id = subj_ids{i};

[trial_data, trial_desc] = linearize_trial_data( js.learn_trial_data.(subj_id) );
meta = extract_meta( js, subj_id );

tbls{i} = to_trial_data_table( trial_data, trial_desc, meta );

end

tbl = vertcat( tbls{:} );

if ( 1 )
  writetable( tbl, fullfile(fileparts(src_p), 'rtdb-export-learn-trial.csv'), 'WriteVariableNames', true );
end

%%

subj_ids = fieldnames( js.bonus_trial_data );
tbls = cell( size(subj_ids) );

for i = 1:numel(subj_ids)
subj_id = subj_ids{i};
[trial_data, trial_desc] = linearize_bonus_trial_data( js.bonus_trial_data.(subj_id) );
meta = extract_meta( js, subj_id );

tbls{i} = to_bonus_trial_data_table( trial_data, trial_desc, meta );

end

tbl = vertcat( tbls{:} );

if ( 1 )
  writetable( tbl, fullfile(fileparts(src_p), 'rtdb-export-bonus.csv'), 'WriteVariableNames', true );
end

%%
  
%%

function t = to_trial_data_table(trial_data, trial_desc, meta)

block = to_cell( [trial_desc.block_index] );
block_trial = to_cell( [trial_desc.trial_index] );
p_high = to_cell( arrayfun(@(x) x.p_large_reward, [trial_desc.image_descriptor]) );

correct = to_cell( [trial_data.correct] );
rewards = to_cell( [trial_data.awarded] );
actions = {trial_data.response};
correct_actions = arrayfun(@(x) {x.correct_response}, [trial_desc.image_descriptor]);
rt = to_cell( [trial_data.rt] );

dates = repmat( {meta.date}, size(rt) );
qualtrics_user_ids = repmat( {meta.qualtrics_user_id}, size(rt) );
subj_ids = repmat( {meta.subject_id}, size(rt) );

m = [ ...
  block(:), block_trial(:), p_high(:), correct(:), rewards(:) ...
  , actions(:), correct_actions(:), rt(:), dates(:), qualtrics_user_ids(:), subj_ids(:) ];

t = array2table( m, 'VariableNames' ...
  , {'block', 'block_trial', 'p_high_rew', 'corrects', 'rewards' ...
  , 'actions', 'actionseq', 'rt', 'date', 'qualtrics_user_id', 'subject_id'});

end

function t = to_bonus_trial_data_table(trial_data, trial_desc, meta)

numeric_field = @(a, s) to_cell( [a.(s)] );
cell_field = @(a, s) {a.(s)};

left_set = numeric_field( [trial_desc.left_image], 'image_set' );
left_num = numeric_field( [trial_desc.left_image], 'image_number' );
left_file = cell_field( [trial_desc.left_image], 'image_url' );

right_set = numeric_field( [trial_desc.right_image], 'image_set' );
right_num = numeric_field( [trial_desc.right_image], 'image_number' );
right_file = cell_field( [trial_desc.right_image], 'image_url' );

block_trial = numeric_field( trial_desc, 'trial_index' );

dates = repmat( {meta.date}, size(block_trial) );
qualtrics_user_ids = repmat( {meta.qualtrics_user_id}, size(block_trial) );
subj_ids = repmat( {meta.subject_id}, size(block_trial) );

responses = { trial_data.response };

m = [ ...
    block_trial(:), responses(:) ...
  , left_set(:), left_num(:), left_file(:) ...
  , right_set(:), right_num(:), right_file(:) ...
  , dates(:), qualtrics_user_ids(:), subj_ids(:) ...
];

t = array2table( m, 'VariableNames' ...
  , {'block_trial', 'response', 'left_image_set', 'left_image_number', 'left_image_url' ...
  , 'right_image_set', 'right_image_number', 'right_image_url' ...
  , 'date', 'qualtrics_user_id', 'subject_id'} );
  

end

function c = to_cell(a)
c = arrayfun( @(x) {x}, a );
end

function [trial_data, trial_desc] = linearize_trial_data(s)

trial_ids = fieldnames( s );
trial_datas = cell( size(trial_ids) );
trial_descs = cell( size(trial_ids) );

for i = 1:numel(trial_ids)
  tid = trial_ids{i};
  trial = s.(tid);
  trial_datas{i} = trial.trial_data;
  trial_descs{i} = trial.trial_desc;
end

trial_data = vertcat( trial_datas{:} );
trial_desc = vertcat( trial_descs{:} );

order_by = [ [trial_desc.block_index]', [trial_desc.trial_index]' ];
[~, perm] = sortrows( order_by );
trial_data = trial_data(perm);
trial_desc = trial_desc(perm);

end

function [trial_data, trial_desc] = linearize_bonus_trial_data(s)

trial_ids = fieldnames( s );
trial_datas = cell( size(trial_ids) );
trial_descs = cell( size(trial_ids) );

for i = 1:numel(trial_ids)
  tid = trial_ids{i};
  trial = s.(tid);
  trial_datas{i} = trial.trial_data;
  trial_descs{i} = trial.trial_desc;
end

trial_data = vertcat( trial_datas{:} );
trial_desc = vertcat( trial_descs{:} );

order_by = [trial_desc.trial_index];
[~, perm] = sort( order_by );
trial_data = trial_data(perm);
trial_desc = trial_desc(perm);

end

function meta = extract_meta(js, subj_id)

meta = js.meta.(subj_id);
meta = meta.(char(fieldnames(meta)));
meta.subject_id = subj_id;

end