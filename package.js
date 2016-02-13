Package.describe({
  name: "aldeed:schema-index",
  summary: "Control some MongoDB indexing with schema options",
  version: "2.0.0",
  git: "https://github.com/aldeed/meteor-schema-index.git"
});

Package.onUse(function(api) {
  api.use([
    'aldeed:collection2-core@1.0.0',
    'underscore@1.0.0',
    'minimongo@1.0.0',
    'check@1.0.0',
    'ecmascript@0.1.6'
  ]);
  
  api.addFiles([
    'lib/indexing.js'
  ]);

  api.addFiles([
    'lib/schemaIndex.js',
    'lib/indexData.js'
  ], 'server');
});

Package.onTest(function(api) {
  api.use([
    'aldeed:schema-index',
    'tinytest@1.0.0',
    'underscore@1.0.0',
    'random@1.0.0',
    'mongo@1.0.0',
    'aldeed:collection2-core@1.0.0',
    'aldeed:simple-schema@1.5.3'
  ]);

  api.addFiles([
    'tests/indexing.js'
  ]);
});
