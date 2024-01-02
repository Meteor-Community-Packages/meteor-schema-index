Package.describe({
  name: 'aldeed:schema-index',
  summary: 'Control some MongoDB indexing with schema options',
  version: '3.0.0',
  documentation: '../../README.md',
  git: 'https://github.com/aldeed/meteor-schema-index.git',
});

Package.onUse(function(api) {
  api.use([
    'aldeed:collection2@4.0.0-beta.6',
    'aldeed:simple-schema@1.13.1',
    'ecmascript',
  ]);

  api.mainModule('client.js', 'client');
  api.mainModule('server.js', 'server');
});
