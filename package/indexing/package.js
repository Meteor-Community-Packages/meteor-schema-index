Package.describe({
  name: 'aldeed:schema-index',
  summary: 'Control some MongoDB indexing with schema options',
  version: '3.1.0',
  documentation: '../../README.md',
  git: 'https://github.com/aldeed/meteor-schema-index.git',
});

Package.onUse(function(api) {
  api.use([
    'aldeed:collection2@3.0.6',
    'ecmascript@0.14.3',
  ]);

  api.mainModule('client.js', 'client');
  api.mainModule('server.js', 'server');
});
