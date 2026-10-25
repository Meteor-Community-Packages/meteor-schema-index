Package.describe({
  name: 'aldeed:schema-index',
  summary: 'Control some MongoDB indexing with schema options',
  version: '5.0.0',
  documentation: '../../README.md',
  git: 'https://github.com/aldeed/meteor-schema-index.git',
});

Package.onUse(function(api) {
  api.versionsFrom('3.1.2');
  api.use("ecmascript");
  api.use([
    'aldeed:collection2@4.0.4 || 5.0.0',
    'aldeed:simple-schema@1.13.1 || 2.0.0 || 3.0.0',
  ]);

  api.mainModule("client.js", "client");
  api.mainModule("server.js", "server");
});
