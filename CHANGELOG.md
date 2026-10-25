# Change Log

## 5.0.0

- Drop Meteor 2 support and require Meteor 3.1.2+.
- Allow `aldeed:collection2@5.0.0` alongside the existing 4.x range.
- Load Collection2 statically so schema attachment works immediately on both client and server.
- Read merged schema definitions for SimpleSchema 3 so indexes inside nested schemas are created.
- Test index creation, uniqueness, sparse and array indexes, and index removal against real MongoDB.
- **Migration:** Nested SimpleSchema 3 indexes previously skipped are now created, including unique indexes. Remove conflicting data before upgrading. Collection2 5 requires Meteor 3.1.2+ and async mutation methods; older dependency ranges remain supported.

## 4.0.1

Added compatibility option with `aldeed:simple-schema` v3

## 4.0.0

Package now depends on `aldeed:simple-schema` instead of NPM package.
Async fixes for Meteor 3, minimum required Meteor version is 2.8.1

## 3.1.1

Added compatibility option with `aldeed:collection2@4.0.4`

## 3.1.0

Update dependencies (`aldeed:collection2@3.5.0`, `ecmascript` according to Meteor version)
Index creation and dropping has been updated to use newer API if available

## 3.0.0

Updated to depend on `aldeed:collection2@3.0.0` rather than `aldeed:collection2-core`. Core has been merged back into the main package as a 3.0.0 release.

## 2.1.2

Split code so that the client build is smaller (thanks @SimonSimCity)

## 2.1.1

Fix default error message for `notUnique` errors

## 2.1.0

Remove meteor/underscore package dependency

## 2.0.0

For use with aldeed:collection2-core@2.0.0. Requires SimpleSchema 2.0

## 1.1.0

Update to work with SimpleSchema 2.0

## 1.0.0

Initial release. Originally included in the aldeed:collection2 package.
