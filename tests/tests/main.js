/* eslint-disable no-shadow */

import expect from "expect";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Random } from "meteor/random";
import SimpleSchema from "simpl-schema";

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "1";

const test = new Mongo.Collection("test");
test.attachSchema(
  new SimpleSchema({
    title: {
      type: String,
      label: "Title",
      max: 200,
      index: 1,
    },
    author: {
      type: String,
      label: "Author",
    },
    copies: {
      type: Number,
      label: "Number of copies",
      min: 0,
    },
    lastCheckedOut: {
      type: Date,
      label: "Last date this book was checked out",
      optional: true,
    },
    summary: {
      type: String,
      label: "Brief summary",
      optional: true,
      max: 1000,
    },
    isbn: {
      type: String,
      label: "ISBN",
      optional: true,
      index: 1,
      unique: true,
    },
    field1: {
      type: String,
      optional: true,
    },
    field2: {
      type: String,
      optional: true,
    },
    createdAt: {
      type: Date,
      optional: true,
    },
    updatedAt: {
      type: Date,
      optional: true,
    },
  })
);

// Add one unique index outside of C2
if (Meteor.isServer) {
  try {
    test._dropIndex({ field1: 1, field2: 1 });
  } catch (error) {
    // ignore
  }
  test._ensureIndex({ field1: 1, field2: 1 }, { unique: true, sparse: true });
}

describe("unique", () => {
  beforeEach(() => {
    test.find({}).forEach((doc) => {
      test.remove(doc._id);
    });
  });

  it("insert does not fail if the value is unique", (done) => {
    const isbn = Random.id();
    // Insert isbn
    test.insert(
      {
        title: "Ulysses",
        author: "James Joyce",
        copies: 1,
        isbn,
      },
      (error, id) => {
        expect(!!error).toBe(false);
        expect(typeof id).toBe("string");

        const validationErrors = test
          .simpleSchema()
          .namedContext()
          .validationErrors();
        expect(validationErrors.length).toBe(0);

        // Insert isbn+'A'
        test.insert(
          {
            title: "Ulysses",
            author: "James Joyce",
            copies: 1,
            isbn: `${isbn}A`,
          },
          (error, id) => {
            expect(!!error).toBe(false);
            expect(typeof id).toBe("string");

            const validationErrors = test
              .simpleSchema()
              .namedContext()
              .validationErrors();
            expect(validationErrors.length).toBe(0);

            done();
          }
        );
      }
    );
  });

  it("insert fails if another document already has the same value", (done) => {
    const isbn = Random.id();
    // Insert isbn
    test.insert(
      {
        title: "Ulysses",
        author: "James Joyce",
        copies: 1,
        isbn,
      },
      (error, id) => {
        expect(!!error).toBe(false);
        expect(typeof id).toBe("string");

        const validationErrors = test
          .simpleSchema()
          .namedContext()
          .validationErrors();
        expect(validationErrors.length).toBe(0);

        // Insert same isbn again
        test.insert(
          {
            title: "Ulysses",
            author: "James Joyce",
            copies: 1,
            isbn,
          },
          (error, id) => {
            expect(error && error.message).toBe("ISBN must be unique");
            expect(!!id).toBe(false);

            const validationErrors = test
              .simpleSchema()
              .namedContext()
              .validationErrors();
            expect(validationErrors.length).toBe(1);

            const key = validationErrors[0] || {};
            expect(key.name).toBe("isbn");
            expect(key.type).toBe("notUnique");

            done();
          }
        );
      }
    );
  });

  it("insert fails on duplicate if there is a unique index from outside collection2", (done) => {
    const val = Meteor.isServer ? "foo" : "bar";

    // Good insert
    test.insert(
      {
        title: "Ulysses",
        author: "James Joyce",
        copies: 1,
        field1: val,
        field2: val,
      },
      (error, id) => {
        expect(!!error).toBe(false);
        expect(typeof id).toBe("string");

        const validationErrors = test
          .simpleSchema()
          .namedContext()
          .validationErrors();
        expect(validationErrors.length).toBe(0);

        // Bad insert
        test.insert(
          {
            title: "Ulysses",
            author: "James Joyce",
            copies: 1,
            field1: val,
            field2: val,
          },
          (error, id) => {
            expect(!!error).toBe(true);
            expect(!!id).toBe(false);

            // No validation errors since created outside C2
            // (Currently we can't tell which field it was from the error message for generic unique messages)
            const validationErrors = test
              .simpleSchema()
              .namedContext()
              .validationErrors();
            expect(validationErrors.length).toBe(0);

            done();
          }
        );
      }
    );
  });

  it("validation without updating", (done) => {
    const context = test.simpleSchema().namedContext();

    const isbn = Random.id();
    // Insert isbn
    test.insert(
      {
        title: "Ulysses",
        author: "James Joyce",
        copies: 1,
        isbn,
      },
      () => {
        // We don't know whether this would result in a non-unique value or not because
        // we don't know which documents we'd be changing; therefore, no notUnique error
        context.validate(
          {
            $set: {
              isbn,
            },
          },
          {
            modifier: true,
          }
        );

        let validationErrors = context.validationErrors();
        expect(validationErrors.length).toBe(0);

        context.validate(
          {
            $set: {
              isbn,
            },
          },
          {
            keys: ["isbn"],
            modifier: true,
          }
        );
        validationErrors = context.validationErrors();
        expect(validationErrors.length).toBe(0);

        done();
      }
    );
  });

  it("updates do not fail when the document being updated has the same value", (done) => {
    const isbn = Random.id();
    // Insert isbn
    test.insert(
      {
        title: "Ulysses",
        author: "James Joyce",
        copies: 1,
        isbn,
      },
      (error, id) => {
        test.update(
          id,
          {
            $set: { isbn },
          },
          (error) => {
            expect(!!error).toBe(false);
            const validationErrors = test
              .simpleSchema()
              .namedContext()
              .validationErrors();
            expect(validationErrors.length).toBe(0);
            done();
          }
        );
      }
    );
  });

  it("update fails if another document already has the same value", (done) => {
    const isbn1 = Random.id();
    const isbn2 = Random.id();

    // Insert isbn1
    test.insert(
      {
        title: "Ulysses",
        author: "James Joyce",
        copies: 1,
        isbn: isbn1,
      },
      (error, id) => {
        expect(!!error).toBe(false);
        expect(typeof id).toBe("string");

        // Insert isbn2
        test.insert(
          {
            title: "Ulysses",
            author: "James Joyce",
            copies: 1,
            isbn: isbn2,
          },
          (error, id) => {
            expect(!!error).toBe(false);
            expect(typeof id).toBe("string");

            // Try changing isbn2 to isbn1
            test.update(
              id,
              {
                $set: { isbn: isbn1 },
              },
              (error, result) => {
                expect(!!error).toBe(true);
                expect(result).toBe(undefined);

                const validationErrors = test
                  .simpleSchema()
                  .namedContext()
                  .validationErrors();
                expect(validationErrors.length).toBe(1);

                const key = validationErrors[0] || {};
                expect(key.name).toBe("isbn");
                expect(key.type).toBe("notUnique");

                done();
              }
            );
          }
        );
      }
    );
  });

  it("properly defines the index for arrays of objects", () => {
    const testCollection = new Mongo.Collection("testCollection");
    // We need to handle arrays of objects specially because the
    // index key must be 'a.b' if, for example, the schema key is 'a.$.b'.
    // Here we make sure that works.
    const testSchema = new SimpleSchema({
      a: Object,
      "a.$": Object,
      "a.$.b": {
        type: String,
        unique: true,
      },
    });

    expect(() => {
      testCollection.attachSchema(testSchema);
    }).not.toThrow();
  });
});
