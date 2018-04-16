# Utils library for ProseMirror

[![npm](https://img.shields.io/npm/v/prosemirror-utils.svg?style=flat-square)](https://www.npmjs.com/package/prosemirror-utils)
[![License](https://img.shields.io/npm/l/prosemirror-utils.svg?style=flat-square)](http://www.apache.org/licenses/LICENSE-2.0)
[![Github Issues](https://img.shields.io/github/issues/atlassian/prosemirror-utils.svg?style=flat-square)](https://github.com/atlassian/prosemirror-utils/issues)
[![CircleCI](https://img.shields.io/circleci/project/github/atlassian/prosemirror-utils.svg?style=flat-square)](https://circleci.com/gh/atlassian/prosemirror-utils)
[![codecov](https://codecov.io/gh/atlassian/prosemirror-utils/branch/master/graph/badge.svg)](https://codecov.io/gh/atlassian/prosemirror-utils)
[![Downloads](https://img.shields.io/npm/dw/prosemirror-utils.svg?style=flat-square)](https://www.npmjs.com/package/prosemirror-utils)
[![Code size](https://img.shields.io/github/languages/code-size/atlassian/prosemirror-utils.svg?style=flat-square)](https://www.npmjs.com/package/prosemirror-utils)

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

@findPositionOfNodeBefore

@findDomRefAtPos

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

@canInsert

@safeInsert

@setParentNodeMarkup

@selectParentNodeOfType

@removeNodeBefore

@setTextSelection

## License

* **Apache 2.0** : http://www.apache.org/licenses/LICENSE-2.0
