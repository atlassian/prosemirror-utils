# Utils library for ProseMirror

[![npm](https://img.shields.io/npm/v/prosemirror-utils.svg?style=flat-square)](https://www.npmjs.com/package/prosemirror-utils)
[![License](https://img.shields.io/npm/l/express.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![CircleCI](https://img.shields.io/circleci/project/github/eshvedai/prosemirror-utils.svg?style=flat-square)](https://circleci.com/gh/eshvedai/prosemirror-utils)
[![Codecov](https://img.shields.io/codecov/c/github/eshvedai/prosemirror-utils.svg?style=flat-square)](https://codecov.io/gh/eshvedai/prosemirror-utils)
[![Github Issues](https://img.shields.io/github/issues/eshvedai/prosemirror-utils.svg?style=flat-square)](https://github.com/eshvedai/prosemirror-utils/issues)
[![Downloads](https://img.shields.io/npm/dw/prosemirror-utils.svg?style=flat-square)](https://www.npmjs.com/package/prosemirror-utils)
[![Code size](https://img.shields.io/github/languages/code-size/eshvedai/prosemirror-utils.svg?style=flat-square)](https://www.npmjs.com/package/prosemirror-utils)

## Quick Start

Install `prosemirror-utils` package from npm:

```sh
npm install prosemirror-utils
```

## Documentation

### Selection

@findParentNode

@findParentDomRef

@hasParentNode

@findParentNodeOfType

@hasParentNodeOfType

@findParentDomRefOfType

@findSelectedNodeOfType

@isNodeSelection

### Node

@flatten

@findChildren

@findTextNodes

@findInlineNodes

@findBlockNodes

@findChildrenByAttr

@findChildrenByType

@findChildrenByMark

@contains

### Tables

@findTable

@isCellSelection

@isColumnSelected

@isRowSelected

@isTableSelected

@getCellsInColumn

@getCellsInRow

@getCellsInTable

@selectColumn

@selectRow

@selectTable

@emptySelectedCells

@addColumnAt

@addRowAt

@removeColumnAt

@removeRowAt

@removeTable

@removeSelectedColumns

@removeSelectedRows

### Transforms

@removeParentNodeOfType

@replaceParentNodeOfType

@removeSelectedNode

@replaceSelectedNode

@safeInsert

@setParentNodeMarkup

@selectParentNodeOfType

## License

* **MIT** : http://opensource.org/licenses/MIT
