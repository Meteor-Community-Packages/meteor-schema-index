import { expect } from 'chai';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'meteor/aldeed:simple-schema';

const collection = new Mongo.Collection('index');
const profile = new SimpleSchema({
  email: { type: String, optional: true, unique: true },
});
collection.attachSchema(new SimpleSchema({
  title: { type: String, index: -1 },
  isbn: { type: String, optional: true, unique: true },
  profile: { type: profile, optional: true },
  items: { type: Array, optional: true },
  'items.$': { type: Object },
  'items.$.code': { type: String, index: true },
}));

async function expectDuplicate(operation) {
  const error = await operation().then(() => null, (err) => err);
  expect(error, 'the duplicate write must reject').to.be.an.instanceOf(Error);
  // Meteor may sanitize MongoDB errors sent over DDP.
  if (Meteor.isServer) expect(error.message).to.match(/unique|duplicate key/i);
}

// Index operations run at startup; wait for the actual MongoDB state.
async function waitForIndexes(target, predicate) {
  for (let attempt = 0; attempt < 250; attempt += 1) {
    const indexes = await target.rawCollection().indexes().catch((error) => {
      if (error.code === 26) return []; // collection not created yet
      throw error;
    });
    if (predicate(indexes)) return indexes;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error('Timed out waiting for schema indexes');
}

describe('schema indexes', function () {
  this.timeout(10000);

  before(async () => {
    if (Meteor.isServer) {
      await waitForIndexes(collection, (list) => list.some((index) => index.name === 'c2_isbn'));
    }
  });

  beforeEach(async () => {
    const docs = await collection.find().fetchAsync();
    await Promise.all(docs.map((doc) => collection.removeAsync(doc._id)));
  });

  it('allows distinct values and multiple omitted optional unique fields', async () => {
    await collection.insertAsync({ title: 'first' });
    await collection.insertAsync({ title: 'second' });
    await collection.insertAsync({ title: 'third', isbn: 'one' });
    await collection.insertAsync({ title: 'fourth', isbn: 'two' });
    expect(await collection.find().countAsync()).to.equal(4);
  });

  it('rejects duplicate inserts', async () => {
    await collection.insertAsync({ title: 'first', isbn: 'same' });
    await expectDuplicate(() => collection.insertAsync({ title: 'second', isbn: 'same' }));
    expect(await collection.find().countAsync()).to.equal(1);
  });

  it('allows unchanged unique values and rejects conflicting updates', async () => {
    const first = await collection.insertAsync({ title: 'first', isbn: 'one' });
    const second = await collection.insertAsync({ title: 'second', isbn: 'two' });
    await collection.updateAsync(first, { $set: { isbn: 'one' } });
    await expectDuplicate(() => collection.updateAsync(second, { $set: { isbn: 'one' } }));
    expect((await collection.findOneAsync(second)).isbn).to.equal('two');
  });

  it('awaits schema validation without a database write', async () => {
    const context = collection.simpleSchema().namedContext();
    await context.validate({ $set: { isbn: 'one' } }, { modifier: true });
    expect(context.validationErrors()).to.have.lengthOf(0);
  });

  if (Meteor.isServer) {
    it('creates descending, sparse unique, and array indexes in MongoDB', async () => {
      const indexes = await waitForIndexes(collection, (list) =>
        list.some((index) => index.name === 'c2_items.$.code'));
      const byName = Object.fromEntries(indexes.map((index) => [index.name, index]));
      expect(byName.c2_title.key).to.deep.equal({ title: -1 });
      expect(byName.c2_isbn).to.include({ unique: true, sparse: true });
      expect(byName['c2_items.$.code'].key).to.deep.equal({ 'items.code': 1 });
    });

    it('indexes fields inside nested SimpleSchema instances', async () => {
      const indexes = await waitForIndexes(collection, (list) =>
        list.some((index) => index.name === 'c2_profile.email'));
      const index = indexes.find((item) => item.name === 'c2_profile.email');
      expect(index.key).to.deep.equal({ 'profile.email': 1 });
      expect(index.unique).to.equal(true);
      await collection.insertAsync({ title: 'first', profile: { email: 'same' } });
      await expectDuplicate(() => collection.insertAsync({ title: 'second', profile: { email: 'same' } }));
    });

    it('drops an existing index with index: false', async () => {
      const target = new Mongo.Collection('drop_index');
      await target.createIndexAsync({ title: 1 }, { name: 'c2_title' });
      target.attachSchema(new SimpleSchema({ title: { type: String, index: false } }));
      await waitForIndexes(target, (list) => !list.some((index) => index.name === 'c2_title'));
    });

    it('rejects duplicates for indexes created outside Collection2', async () => {
      const target = new Mongo.Collection('external_index');
      await target.removeAsync({});
      await target.createIndexAsync({ title: 1 }, { unique: true });
      target.attachSchema(new SimpleSchema({ title: String }));
      await target.insertAsync({ title: 'same' });
      await expectDuplicate(() => target.insertAsync({ title: 'same' }));
    });
  }
});
