import assert from 'assert';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'meteor/aldeed:simple-schema';

// Attaching during module evaluation also verifies that Collection2 is loaded
// before application code runs, on both the client and the server.
const indexed = new Mongo.Collection('schemaIndexCompatibility');
indexed.attachSchema(new SimpleSchema({
  slug: { type: String, optional: true, unique: true },
  rank: { type: Number, optional: true, index: -1 },
  address: {
    type: new SimpleSchema({ city: { type: String, index: 1 } }),
    optional: true,
  },
  items: { type: Array, optional: true },
  'items.$': { type: Object },
  'items.$.code': { type: String, index: true },
}));

describe('schema-index compatibility', () => {
  it('attaches schemas before application modules evaluate', () => {
    assert.ok(indexed.simpleSchema());
  });

  if (Meteor.isServer) {
    let indexes;

    before(async function () {
      this.timeout(10000);
      // Schema indexes are scheduled at startup; wait for Mongo to build them.
      for (let attempt = 0; attempt < 50; attempt += 1) {
        try {
          indexes = await indexed.rawCollection().indexes();
          if (indexes.length === 5) return;
        } catch (error) {
          if (error.code !== 26) throw error; // Collection not created yet.
        }
        await new Promise((resolve) => { setTimeout(resolve, 100); });
      }
      throw new Error('Schema indexes were not created');
    });

    beforeEach(async () => { await indexed.removeAsync({}); });

    it('creates a descending index', () => {
      assert.deepStrictEqual(indexes.find((index) => index.name === 'c2_rank').key, { rank: -1 });
    });

    it('creates a sparse unique index for an optional field', async () => {
      const index = indexes.find((item) => item.name === 'c2_slug');
      assert.strictEqual(index.unique, true);
      assert.strictEqual(index.sparse, true);
      await indexed.insertAsync({});
      await indexed.insertAsync({});
      await indexed.insertAsync({ slug: 'same' });
      // Check rejection and stored data without depending on Collection2's
      // version-specific formatting of Mongo duplicate-key errors.
      await assert.rejects(() => indexed.insertAsync({ slug: 'same' }));
      assert.strictEqual(await indexed.find({ slug: 'same' }).countAsync(), 1);
    });

    it('indexes fields declared in a nested SimpleSchema', () => {
      assert.deepStrictEqual(indexes.find((index) => index.name === 'c2_address.city').key,
        { 'address.city': 1 });
    });

    it('normalizes array item paths for Mongo indexes', () => {
      assert.deepStrictEqual(indexes.find((index) => index.name === 'c2_items.$.code').key,
        { 'items.code': 1 });
    });
  }
});
