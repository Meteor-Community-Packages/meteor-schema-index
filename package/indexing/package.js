Package.describe({
  name: 'aldeed:schema-index',
  summary: 'Control some MongoDB indexing with schema options',
  version: '4.0.0-beta.5',
  documentation: '../../README.md',
  git: 'https://github.com/aldeed/meteor-schema-index.git',
});

Package.onUse(function(api) {
  api.versionsFrom(["2.8.1", '3.0.1', '3.1']);
  api.use("ecmascript");
  api.use([
    'aldeed:collection2@4.0.4',
    'aldeed:simple-schema@1.13.1 || 2.0.0',
  ]);

  api.mainModule("client.js", "client");
  api.mainModule("server.js", "server");
});
