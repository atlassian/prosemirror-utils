## 1.0.0 (2020-09-21)

### Changed

- Breaking change; removed `prosemirror-tables` dependency

All utility functions related to tables will be moved to `editor-tables`. A link will be added once it is publicly available.

We are in the process of deprecating `promisemirror-tables` as the code has become increasingly difficult to maintain.

## 0.9.6 (2018-08-07)

### Changed

- Upgrade prosemirror-tables dependecy to 0.9.1

### Fixed

- Fix types for convertTableNodeToArrayOfRows and convertArrayOfRowsToTableNode, they were using ProsemirrorModel[] instead of Array<ProsemirrorModel[] | null>

## 0.5.0 (2018-06-04)

### Breaking changes

Changed returning value of all selection utils to `{ node, start, pos}`, where
  * `start` points to the start position of the node
  * `pos` points directly before the node
  * `node` ProseMirror node
Previously, `pos` used to point to the `start` position of the node.
