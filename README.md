[![Build Status](https://travis-ci.org/aldeed/meteor-schema-index.png?branch=master)](https://travis-ci.org/aldeed/meteor-schema-index)

aldeed:schema-index
=========================

A Meteor package that allows you to control some MongoDB indexing from your SimpleSchema. This package is currently included automatically with the aldeed:collection2 package.

## Installation

In your Meteor app directory, enter:

```
$ meteor add aldeed:schema-index
```

## Migration from 1.0.x to 2.0.x
Version 1.0.x used index definitions exclusively on a collection's simpleschema.  Version 2 moves some of the index properties to an external function call (`attachIndex`).  Migration from 1.x to 2.x requires modificaiton of the simpleschema and addition of a call to `attachIndex` for each index to create.  For example in version 1.0.x:

```js
var books = new Mongo.Collection('books');
books.attachSchema(new SimpleSchema({
  title: {
    type: String,
    label: 'Title',
    max: 200,
    index: true
  },
  author: {
    type: String,
    label: 'Author'
  },
  isbn: {
    type: String,
    label: 'ISBN',
    optional: true,
    index: 1,
    unique: true
  },
  //...
}));
```

In version 2.0.x:

```js
var books = new Mongo.Collection('books');
books.attachSchema(new SimpleSchema({
  title: {
    type: String,
    label: 'Title',
    max: 200,
    index: {
      name: 'title',
      type:-1
    }
  },
  author: {cccccccblegetujrrtbgfrcncllvketghefdehvhiuln
  
    type: String,
    label: 'Author'
  },
  isbn: {
    type: String,
    label: 'ISBN',
    optional: true,
    index: {name: 'isbn'}
  },
  //...
}));

books.attachIndex('title');  //uses default index options
books.attachIndex('isbn', {
    unique: true,
    action: 'rebuild' //<-- drops and recreates the index EVERY TIME you restart.
  }
);
```

For now, the index names added to mongo will not match the index names you specify.  It is overridden to maintain some compatibility with collection2 due to a limitation in how collection2 determines invalid keys for its invalidKeys() method.  Importantly, collection2 will not be able to determine the invalid keys for composite indexes if a constrain violation occurs. 


## Usage

Use the `index` option to ensure a MongoDB index for a specific field,or for multiple fields, add the same index to each:

```js
{
  title: {
    type: String,
    index: {
      name: 'titleIndex',
      type: 1
  }
}
```
Set to value to `1` for an ascending index. Set to `-1` for a descending index. Or you may set this to another type of specific MongoDB index, such as `"2d"`. Indexes work on embedded sub-documents as well.
Then attach the index to the collection in much the same way as you attach a schema to a collection:

```js
books.attchIndex('titleIndex');
```

If you have created an index for a field by mistake and you want to remove or change it, set `action` to `rebuild` or `drop`:

```js
books.attchIndex('titleIndex', 
  {
    action: 'drop' //options are: 'rebuild', 'build', or 'drop' 
  }
);
```

IMPORTANT: If you need to change anything about an index, you must first start the app with `action: 'rebuild'` to drop the old index and recreate the index from scratch.

If an index has the `unique` option set to `true`, the MongoDB index will be a unique index as well. Then on the server, Collection2 will rely on MongoDB to check uniqueness of your field, which is more efficient than our custom checking.

```js
books.attchIndex('pseudo', 
  {
    unique: true
  }
);
```

The error message for uniqueness is very generic. It's best to define your own using `MyCollection.simpleSchema().messages()`. The error type string is "notUnique".

Any mongo index option can be passed to `attachIndex` with all the same restrictions that Mongo places on you, except the `name` option.  The `name` option is set by the first parameter to `attachIndex`.  See the [Mongo Docs](https://docs.mongodb.org/v3.0/reference/method/db.collection.createIndex/#db.collection.createIndex) for a complete list of available index options.

You can use the `sparse` option along with the `index` and `unique` options to tell MongoDB to build a [sparse index](http://docs.mongodb.org/manual/core/index-sparse/#index-type-sparse). By default, MongoDB will only permit one document that lacks the indexed field. By setting the `sparse` option to `true`, the index will only contain entries for documents that have the indexed field. The index skips over any document that is missing the field. This is helpful when indexing on a key in an array of sub-documents. Learn more in the [MongoDB docs](http://docs.mongodb.org/manual/core/index-unique/#unique-index-and-missing-field).

All indexes are built in the background by default so indexing does *not* block other database queries.  This can be changed by explicitly setting the `background` option to false, but please use caution when doing so.

## Contributing

Anyone is welcome to contribute. Fork, make and test your changes (`meteor test-packages ./`), and then submit a pull request.

### Major Contributors

@dpankros
@mquandalle

(Add yourself if you should be listed here.)
