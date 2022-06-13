script_p = which( 'gen_json_design_matrices' );
assert( ~isempty(script_p), 'Missing script on path.' );
m_p = fullfile( fileparts(fileparts(script_p)), 'notes/RLWMPST_Short/NewInputsLSSt' );
ms = shared_utils.io.findmat( m_p );

js = {};
for i = 1:numel(ms)
  mat = shared_utils.io.fload( ms{i} );
  for j = 1:numel(mat)
    js{end+1} = transform_design_matrix( mat{j}, i, j );
  end
end

js = horzcat( js{:} );
jse = jsonencode( js );