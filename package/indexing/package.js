Package.describe({
  name: 'aldeed:schema-index',
  summary: 'Control some MongoDB indexing with schema options',
  version: '4.0.0',
  documentation: '../../README.md',
  git: 'https://github.com/aldeed/meteor-schema-index.git',
});

Package.onUse(function(api) {
  api.versionsFrom(["1.12.1", "2.3.6", "2.8.1"]);
  api.use("ecmascript");
  api.use([
    'aldeed:collection2@4.0.0-beta.6',
    'aldeed:simple-schema@1.13.1',
  ]);

  api.mainModule("client.js", "client");
  api.mainModule("server.js", "server");
});
