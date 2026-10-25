// collection2 checks to make sure that simpl-schema package is added

import 'meteor/aldeed:collection2/static';
import SimpleSchema from "meteor/aldeed:simple-schema";

// Extend the schema options allowed by SimpleSchema
SimpleSchema.extendOptions([
  "index", // one of Number, String, Boolean
  "unique", // Boolean
  "sparse", // Boolean
]);

Collection2.on("schema.attached", (collection, ss) => {
  // Define validation error messages
  if (
    ss.version >= 2 &&
    ss.messageBox &&
    typeof ss.messageBox.messages === "function"
  ) {
    ss.messageBox.messages({
      en: {
        notUnique: "{{label}} must be unique",
      },
    });
  }
});
