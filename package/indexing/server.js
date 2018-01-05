import Collection2 from 'meteor/aldeed:collection2';
import { Meteor } from 'meteor/meteor';
import Future from 'fibers/future';

import './common';

Collection2.on('schema.attached', (collection, ss) => {
  function ensureIndex(index, name, unique, sparse) {
    Meteor.startup(() => {
      collection._collection._ensureIndex(index, {
        background: true,
        name,
        unique,
        sparse,
      });
    });
  }

  function dropIndex(indexName) {
    Meteor.startup(() => {
      try {
        collection._collection._dropIndex(indexName);
      } catch (err) {
        // no index with that name, which is what we want
      }
    });
  }

  function getCollectionIndexes(rawCollection) {
    try {
      const future = new Future();
      rawCollection.indexes(future.resolver());

      return future.wait();
    } catch (exception) {
      return [];
    }
  }

  const propName = ss.version === 2 ? 'mergedSchema' : 'schema';

  // Loop over fields definitions and ensure collection indexes (server side only)
  const schema = ss[propName]();

  const existingIndexes = {};
  getCollectionIndexes(collection._collection.rawCollection()).forEach((index) => {
    existingIndexes[index.name] = index;
  });

  Object.keys(schema).forEach((fieldName) => {
    const definition = schema[fieldName];
    if ('index' in definition || definition.unique === true) {
      const index = {};
      // If they specified `unique: true` but not `index`,
      // we assume `index: 1` to set up the unique index in mongo
      let indexValue;
      if ('index' in definition) {
        indexValue = definition.index;
        if (indexValue === true) indexValue = 1;
      } else {
        indexValue = 1;
      }

      const indexName = `c2_${fieldName}`;
      // In the index object, we want object array keys without the ".$" piece
      const idxFieldName = fieldName.replace(/\.\$\./g, '.');
      index[idxFieldName] = indexValue;
      const unique = !!definition.unique && (indexValue === 1 || indexValue === -1);
      let sparse = definition.sparse || false;

      // If unique and optional, force sparse to prevent errors
      if (!sparse && unique && definition.optional) sparse = true;

      if (indexValue === false) {
        dropIndex(indexName);
      } else {
        // If the value of 'unique' or 'sparse' changes, please re-create this index.
        if (indexName in existingIndexes && (
          !!existingIndexes[indexName].unique !== unique ||
          !!existingIndexes[indexName].sparse !== sparse
        )) {
          dropIndex(indexName);
        }
        ensureIndex(index, indexName, unique, sparse);
      }
    }
  });
});
