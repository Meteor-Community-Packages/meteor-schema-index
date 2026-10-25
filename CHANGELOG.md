# Change Log

## 5.0.0

Added compatibility with `aldeed:collection2` v5 alongside v4.

Load `aldeed:collection2` through its static entry instead of `Collection2.load()`. On Meteor 3 the lazy import resolves after app code has already called `attachSchema`.

Fields declared in sub-schemas are indexed with `aldeed:simple-schema` v3 as well (the `mergedSchema()` path was only taken for v2).

Added client and server compatibility tests for schema attachment, nested and array indexes, and sparse unique indexes.

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
