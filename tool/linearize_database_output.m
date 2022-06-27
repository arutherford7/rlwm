js = jsondecode( fileread('C:\Users\nick\Downloads\rlwm-test-default-rtdb-export.json') );

%%

subj_ids = fieldnames( js.meta );
subj_id = subj_ids{1};

[trial_data, trial_desc] = linearize_trial_data( js.learn_trial_data.(subj_id) );

tbl = to_trial_data_table( trial_data, trial_desc );
  
%%

function t = to_trial_data_table(trial_data, trial_desc)

block = to_cell( [trial_desc.block_index] );
block_trial = to_cell( [trial_desc.trial_index] );
p_high = to_cell( arrayfun(@(x) x.p_large_reward, [trial_desc.image_descriptor]) );

correct = to_cell( [trial_data.correct] );
rewards = to_cell( [trial_data.awarded] );
actions = {trial_data.response};
correct_actions = arrayfun(@(x) {x.correct_response}, [trial_desc.image_descriptor]);
rt = to_cell( [trial_data.rt] );

m = [ ...
  block(:), block_trial(:), p_high(:), correct(:), rewards(:) ...
  , actions(:), correct_actions(:), rt(:) ];

t = array2table( m, 'VariableNames' ...
  , {'block', 'block_trial', 'p_high_rew', 'corrects', 'rewards' ...
  , 'actions', 'actionseq', 'rt'});

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