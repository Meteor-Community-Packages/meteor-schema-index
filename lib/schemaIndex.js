/**
 * IndexData - internal class used to track information about the index as it
 * comes in
 */

class IndexData {
  constructor(name) {
    check(name, String);
    this._name = name;
    this._options = {
      background: true //default
    };
    this._fields = {};
    this._action = 'build';
  }

  get name() {
    return this._name;
  }

  get options() {
    return this._options;
  }

  set options(val) {
    if (!val) return;

    if (val.action) {//strip out action, if it is present
      this._action = val.action;
      delete val.action;
    }

    //name object must be last to override anything passed in
    _(this._options).extend(val, {name: this.name});
  }

  setOptionValue(option, value) {
    this.options[option] = value;
  }

  getOptionValue(option) {
    return this.options[option];
  }


  get fields() {
    return this._fields;
  }

  addFieldIndex(fieldName, fieldType) {
    var fieldName = fieldName.replace(/\.\$\./g, ".");
    this.fields[fieldName] = fieldType;
  }

  get needsBuild() {
    return this.action === 'build' || this.action === 'rebuild';
  }

  get needsDrop() {
    return this.action === 'rebuild' || this.action === 'drop';
  }

  get action() {
    return this._action;
  }
}


/**
 * Primary class for tracking indexData and their definitions
 * @type {SchemaIndex}
 */
SchemaIndex = class SchemaIndex {
  /**
   * Adds an index, if it doesn't already exist
   * @param collection the Mongo collection object
   * @param name The name of the index
   * @param index A map of fields to types
   * @param opt_options A map of options for createIndex
   */
  static ensureIndex(collection, name, index, opt_options) {
    try {
      if (index.length === 0) {
        throw new Error('Cannot create an index with no fields');
      }
    }catch(e){
      console.log('error', collection,name, index, opt_options);
      throw e;
    }
    collection._collection._ensureIndex(index, opt_options);
  }

  /**
   * Removes an index if it exists, suppresses any errors otherwise
   * @param collection The Mongo Collection
   * @param indexName The name of the index to drop
   */
  static dropIndex(collection, indexName) {
    try {
      collection._collection._dropIndex(indexName);
    } catch (err) {
      // no index with that name, which is what we want
    }
  }

  constructor() {
    this._indexes = {};
    this._toBeAttached = [];
    this._isSchemaAttached = false;
  }

  //
  // index object methods
  //
  get indexData() {
    return this._indexes;
  }

  /**
   * Adds an IndexData object
   * @param name
   * @returns {*}
   */
  addIndexDatum(name) {
    var indexData = this.getOrCreateIndexDatum(name);

    if (!this.isSchemaAttached) {//queue the index
      this._toBeAttached = this._toBeAttached.concat(name);
      debugger;
    }
    return indexData;
  }

  /**
   * Fetches a names IndexData object
   * @param name
   * @returns {*}
   */
  getIndexDatum(name) {
    return this.indexData[name];
  }

  /**
   * Fetches an IndexData object.  Creates it, if it doesn't exist.
   * @param name The name of the new index
   * @returns {*}
   */
  getOrCreateIndexDatum(name) {
    var index = this.indexData[name];
    if (!index) {
      index = new IndexData(name);
      this.indexData[name] = index;
    }
    return index;
  }

  /**
   * Adds a field to an index
   * @param field The field name
   * @param indexName The indexName
   * @param opt_type The type of the index on the field 1 is ascending, -1 is descending, etc..
   * @returns {SchemaIndex}
   */
  addIndexFieldDef(field, indexName, opt_type = 1) {
    var id = this.getOrCreateIndexDatum(indexName);
    id.addFieldIndex(field, opt_type);
    return this;
  }

  //
  // toBeAttached properties and methods
  //

  /**
   * The names of the indexData queued up to be added, removed, or updated as
   * soon as as simpleschema is attached
   * @returns {Array}
   */
  get toBeAttached() {
    return this._toBeAttached;
  }

  /**
   * Called when a collection and simple schema are attached to shemaIndex.
   * The simpleschema can be parsed so we can see what fields are being used for
   * indexData.
   * @param collection
   * @param ss
   */
  attach(collection, ss) {
    var self = this;

    this._collection = collection;
    //this._ss = ss;

    _.each(ss.schema(), function(definition, fieldName) {
        if ('index' in definition) {
          var indexDefs;
          if (definition.index instanceof Object) {
            indexDefs = [definition.index];
          } else {
            throw new Error('Unsupported type set for index: ' + definition.index);
          }

          //supports multiple indexData per field, but not exposed in schema options
          //because mongo doesn't support it
          self.addIndexFieldDefs(indexDefs, fieldName);
        }
      }
    );

    this._isSchemaAttached = true;

    this.processQueuedIndexes();
  }


  addIndexFieldDefs(indexDefs, fieldName) {
    for (var i = 0; i < indexDefs.length; i++) {
      var indexDef = indexDefs[i];
      if (indexDef) {
        var indexName = indexDef.name;
        var indexType = indexDef.type || 1;

        check(indexName, String);
        this.addIndexFieldDef(fieldName, indexName, indexType);
      }
    }
  }

  processQueuedIndexes() {
    for (var i = 0; i < this.toBeAttached.length; i++) {
      this.processIndex(this.toBeAttached[i]);
    }
    this._toBeAttached.length = 0;
  }


  /**
   * Drops, Creates, or recreates a named index.  A simpleschema MUST BE
   * ATTACHED for this to work otherwise it will just bail out.
   * @param indexName  The name of the index to create.
   */
  processIndex(indexName) {
    if (!this.isSchemaAttached) return;

    check(indexName, String);
    var index = this.getIndexDatum(indexName);

    if (index && this.collection) {
      //the index has already been attached. We can proceed.
      var self = this;
      Meteor.startup(function() {
          if (index.needsDrop) {
            SchemaIndex.dropIndex(self.collection, indexName);
          }

          if (index.needsBuild) {
            SchemaIndex.ensureIndex(self.collection, indexName, index.fields,
              index.options
            );
          }
        }
      );
    }
  }

  /**
   * iSchemaAttached returns whether c2.attachSchema has been called on the collection
   * if it hasn't, indexData are queued up to be attached when the schema is attached.
   * If it has, the index can be attached straight away.
   * @returns {boolean}
   */
  get isSchemaAttached() {
    return this._isSchemaAttached;
  }

  /**
   * The Mongo.Collection object if attached or undefined if not attached
   * @returns {*}
   */
  get collection() {
    return this._collection;
  }

  /**
   * The SimpleSchema object if attached or undefined if not attached
   * @returns {*}
   */
  get simpleSchema() {
    return this._ss;
  }
}
