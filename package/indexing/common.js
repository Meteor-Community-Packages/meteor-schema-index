// collection2-core checks to make sure that simpl-schema package is added
import SimpleSchema from 'simpl-schema';
import Collection2 from 'meteor/aldeed:collection2-core';

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
