import Collection2 from 'meteor/aldeed:collection2';
import { Meteor } from 'meteor/meteor';

import './common';

Collection2.on('schema.attached', (collection, ss) => {
  function ensureIndex(index, options) {
    Meteor.startup(() => {
      collection._collection._ensureIndex(index, {
        background: true,
        ...options,
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

  const propName = ss.version === 2 ? 'mergedSchema' : 'schema';

  // Loop over fields definitions and ensure collection indexes (server side only)
  const schema = ss[propName]();
  const textIndex = new Map();
  let textIndexSparse = false;
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
        if (indexValue === 'text') {
          textIndex.set(indexValue, definition.indexWeight || 1);
          textIndexSparse = textIndexSparse || !!definition.optional;
          return;
        }
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
        ensureIndex(index, { name: indexName, unique, sparse });
      }
    }
    if (textIndex.length > 0) {
      const index = {};
      const weights = {};
      textIndex.forEach((v, k) => {
        index[k] = 'text';
        weights[k] = v;
      });
      ensureIndex(index, { name: 'c2_textIndex', sparse: textIndexSparse, weights });
    }
  });
});
