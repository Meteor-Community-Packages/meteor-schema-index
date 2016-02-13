/**
 * IndexData - internal class used to track information about the index as it
 * comes in
 */

IndexData = class IndexData {
  constructor(name) {
    check(name, String);
    this._name = name;
    this._options = {
      background: true //default
    };
    this._fields = {};
    this._action = 'build';
    this.c2_compatFix = true;
    if (this.c2_compatFix) {
      this._idxName = 'c2_';
    }
  }

  get name() {
    return this._name;
  }

  get options() {
    if (this.c2_compatFix) {
      return _({}).extend(this._options, {name: this._idxName});
    } else {
      return this._options;
    }
  }

  set options(val) {
    if (!val) return;

    if (val.action) {//strip out action, if it is present
      this._action = val.action;
      delete val.action;
    }

    if (!this.c2_compatFix) {
      //name object must be last to override anything passed in
      _(this._options).extend(val, {name: this.name});
    } else {
      _(this._options).extend(val);
    }
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
    if (this.c2_compatFix) {
      this._idxName = this._idxName + fieldName;
    }
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

