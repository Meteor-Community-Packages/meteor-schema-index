aldeed:schema-index
=========================

A Meteor package that allows you to control some MongoDB indexing from your SimpleSchema.

## Installation

In your Meteor app directory, enter:

```
$ meteor add aldeed:schema-index
```

## Compatibility

Requires Meteor 3.1.2+. Supports `aldeed:collection2` 4.x from 4.0.4 and 5.x, with `aldeed:simple-schema` 1.13.1, 2.x, or 3.x where supported by Collection2. Use SimpleSchema 3 with Collection2 5. Collection2 5 requires Meteor 3.1.2+ and `insertAsync`, `updateAsync`, and `upsertAsync`.

The test app uses Meteor 3.5.3. CI tests Collection2 4.0.4 / SimpleSchema 1.13.1, Collection2 4.2.2 / SimpleSchema 2.0.0, and Collection2 5.0.0 / SimpleSchema 3.0.0 on the server and in a headless browser.

### Upgrading to 5.0.0

Meteor 2 is no longer supported. Upgrade to Meteor 3.1.2+ before installing schema-index 5, or stay on schema-index 4.x.

Indexes inside nested SimpleSchema 3 instances are now created correctly. This includes unique indexes that older versions silently skipped. Check for duplicate values before upgrading; MongoDB will reject building a unique index over conflicting data.

## Usage

Use the `index` option to ensure a MongoDB index for a specific field:

```js
{
  title: {
    type: String,
    index: 1
  }
}
```

Set to `1` or `true` for an ascending index. Set to `-1` for a descending index. Or you may set this to another type of specific MongoDB index, such as `"2d"`. Indexes work on embedded sub-documents as well.

If you have created an index for a field by mistake and you want to remove or change it, set `index` to `false`:

```js
{
  "address.street": {
    type: String,
    index: false
  }
}
```

IMPORTANT: If you need to change anything about an index, you must first start the app with `index: false` to drop the old index, and then restart with the correct index properties.

If a field has the `unique` option set to `true`, the MongoDB index will be a unique index as well. Then on the server, Collection2 will rely on MongoDB to check uniqueness of your field, which is more efficient than our custom checking.

```js
{
  "pseudo": {
    type: String,
    index: true,
    unique: true
  }
}
```

For the `unique` option to work, `index` must be `true`, `1`, or `-1`. The error message for uniqueness is very generic. It's best to define your own using `MyCollection.simpleSchema().messages()`. The error type string is "notUnique".

You can use the `sparse` option along with the `index` and `unique` options to tell MongoDB to build a [sparse index](http://docs.mongodb.org/manual/core/index-sparse/#index-type-sparse). By default, MongoDB will only permit one document that lacks the indexed field. By setting the `sparse` option to `true`, the index will only contain entries for documents that have the indexed field. The index skips over any document that is missing the field. This is helpful when indexing on a key in an array of sub-documents. Learn more in the [MongoDB docs](http://docs.mongodb.org/manual/core/index-unique/#unique-index-and-missing-field).

All indexes are built in the background so indexing does *not* block other database queries.

## Contributing

Anyone is welcome to contribute. Fork, make and test your changes (`meteor test-packages ./`), and then submit a pull request.

### Running Tests

```bash
$ cd tests
$ npm i && npm test
```

### Running Tests in Watch Mode

```bash
$ cd tests
$ npm i && npm run test:watch
```

### Major Contributors

@mquandalle

(Add yourself if you should be listed here.)
