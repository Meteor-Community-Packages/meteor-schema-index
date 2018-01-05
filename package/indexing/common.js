// collection2-core checks to make sure that simpl-schema package is added
import SimpleSchema from 'simpl-schema';
import Collection2 from 'meteor/aldeed:collection2-core';
import { Meteor } from 'meteor/meteor';

// Extend the schema options allowed by SimpleSchema
SimpleSchema.extendOptions([
  'index', // one of Number, String, Boolean
  'unique', // Boolean
  'sparse', // Boolean
]);

Collection2.on('schema.attached', function (collection, ss) {
  // Define validation error messages
  if (ss.version >= 2 && ss.messageBox && typeof ss.messageBox.messages === 'function') {
    ss.messageBox.messages({
      en: {
        notUnique: '{{label}} must be unique',
      },
    });
  }
});

if (Meteor.isServer) {
  Collection2.on('schema.attached', function (collection, ss) {
    function ensureIndex(index, indexName, unique, sparse) {
      Meteor.startup(function () {
        collection._collection._ensureIndex(index, {
          background: true,
          name: indexName,
          unique: unique,
          sparse: sparse
        });
      });
    }

    function dropIndex(indexName) {
      Meteor.startup(function () {
        try {
          collection._collection._dropIndex(indexName);
        } catch (err) {
          // no index with that name, which is what we want
        }
      });
    }

    const propName = ss.version === 2 ? 'mergedSchema' : 'schema';

    // Loop over fields definitions and ensure collection indexes (server side only)
    var schema = ss[propName]();
    Object.keys(schema).forEach(function (fieldName) {
      var definition = schema[fieldName];
      if ('index' in definition || definition.unique === true) {
        var index = {}, indexValue;
        // If they specified `unique: true` but not `index`,
        // we assume `index: 1` to set up the unique index in mongo
        if ('index' in definition) {
          indexValue = definition.index;
          if (indexValue === true) indexValue = 1;
        } else {
          indexValue = 1;
        }
        var indexName = 'c2_' + fieldName;
        // In the index object, we want object array keys without the ".$" piece
        var idxFieldName = fieldName.replace(/\.\$\./g, ".");
        index[idxFieldName] = indexValue;
        var unique = !!definition.unique && (indexValue === 1 || indexValue === -1);
        var sparse = definition.sparse || false;

        // If unique and optional, force sparse to prevent errors
        if (!sparse && unique && definition.optional) sparse = true;

        if (indexValue === false) {
          dropIndex(indexName);
        } else {
          ensureIndex(index, indexName, unique, sparse);
        }
      }
    });
  });
}
