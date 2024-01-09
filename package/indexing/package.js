Package.describe({
  name: "aldeed:schema-index",
  summary: "Control some MongoDB indexing with schema options",
  version: "3.1.0",
  documentation: "../../README.md",
  git: "https://github.com/aldeed/meteor-schema-index.git",
});

Package.onUse(function (api) {
  api.versionsFrom(["1.12.1", "2.3.6", "2.8.1"]);
  api.use("ecmascript");
  api.use("aldeed:collection2@3.5.0");

  api.mainModule("client.js", "client");
  api.mainModule("server.js", "server");
});
