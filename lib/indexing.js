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

    var self = this;
    options = options || {};
    self._si = self._si || new SchemaIndex();
    self._si.addIndexData(name).options = options;

    //wait until the simple schema has been attached before building indexData
    if (self._si.isSchemaAttached) {
      self._si.processIndex(name);
    }
  };

  Collection2.on('schema.attached', function (collection, ss) {
    collection._si = collection._si || new SchemaIndex();
    collection._si.attach(collection, ss);
  });
}