// Extend the schema options allowed by SimpleSchema
SimpleSchema.extendOptions({
  index: Match.Optional(Object)
});

// Define validation error messages
SimpleSchema.messages({
  notUnique: "[label] must be unique",
});

if (Meteor.isServer) {

  Mongo.Collection.prototype.attachIndex = function siAttachIndex(name, options) {
    check(name, String);

    options = options || {};
    var si = this._si || new SchemaIndex();
    si.addIndexData(name).options = options;
    si.processIndex(name);
  };

  Collection2.on('schema.attached', function (collection, ss) {
    collection._si = collection._si || new SchemaIndex();
    collection._si.attach(collection, ss);
  });
}