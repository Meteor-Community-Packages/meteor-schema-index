Package.describe({
  name: 'aldeed:schema-index',
  summary: 'Control some MongoDB indexing with schema options',
  version: '4.0.0-beta.2',
  documentation: '../../README.md',
  git: 'https://github.com/aldeed/meteor-schema-index.git',
});

Package.onUse(function(api) {
  api.versionsFrom(["2.8.1", '3.0-beta.4']);
  api.use("ecmascript");
  api.use([
    'aldeed:collection2@4.0.0',
    'aldeed:simple-schema@1.13.1',
  ]);

  api.mainModule("client.js", "client");
  api.mainModule("server.js", "server");
});
