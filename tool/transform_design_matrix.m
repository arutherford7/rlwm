function js = transform_design_matrix(mat, subj, session)

%{
design{<session>}.<var>{block}

design{s}.stSets(b):
  double, scalar: image set (folder) index

design{s}.stimuli{b}:
  double, scalar: image file index, within a set / folder
  
design{s}.rules{b}:
  double, numel(stimuli)
  the correct action index for each image  
  the correct action index for (stimseq == i) is design{s}.rules{b}(i):
        actionseq=0*stimseq;
        TS=rules{b};
        for i=1:nS
            actionseq(stimseq==i)=TS(i);
        end

design{s}.Actions:
  mapping between rule indices and key names, length == 3
  the correct action for stimulus (i) is Actions(rules(i));
  Actions(Actions == 13) = KbName('C');
  Actions(Actions == 14) = KbName('V');
  Actions(Actions == 15) = KbName('B');

design{s}.stSeqs{b}:
  double, length == num trials: index of image to display

design{s}.FBseq{b}:
  double, length >= num trials: p large reward. 
    FBprobSeq(FBprobSeq==1) = .8;
    FBprobSeq(FBprobSeq==2) = .5;
    FBprobSeq(FBprobSeq==3) = .2;
%}

js = struct();

keys = cell( 1, 3 );
keys(mat.Actions == 13) = {'c'};
keys(mat.Actions == 14) = {'v'};
keys(mat.Actions == 15) = {'b'};

correct_responses = cellfun( @(stims, rules) keys(rules(stims)) ...
  , mat.stSeqs, mat.rules, 'un', 0 );

rewards = [ 0.8, 0.5, 0.2 ];
p_large_rewards = cellfun( @(x) rewards(x), mat.FBseq, 'un', 0 );

js.image_sets = mat.stSets;
js.image_numbers = mat.stimuli;
js.correct_responses = correct_responses;
js.p_large_rewards = p_large_rewards;
js.image_sequences = cellfun( @(x) x - 1, mat.stSeqs, 'un', 0 );
js.num_blocks = numel( mat.blocks );
js.image_set_sizes = mat.blocks;
js.subject_number = subj;
js.session_number = session;

end