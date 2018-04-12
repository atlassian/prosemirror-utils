# Utils library for ProseMirror

[![npm](https://img.shields.io/npm/v/prosemirror-utils.svg?style=flat-square)](https://www.npmjs.com/package/prosemirror-utils)
[![License](https://img.shields.io/npm/l/prosemirror-utils.svg?style=flat-square)](http://www.apache.org/licenses/LICENSE-2.0)
[![Github Issues](https://img.shields.io/github/issues/atlassial/prosemirror-utils.svg?style=flat-square)](https://github.com/atlassial/prosemirror-utils/issues)
[![Downloads](https://img.shields.io/npm/dw/prosemirror-utils.svg?style=flat-square)](https://www.npmjs.com/package/prosemirror-utils)
[![Code size](https://img.shields.io/github/languages/code-size/atlassial/prosemirror-utils.svg?style=flat-square)](https://www.npmjs.com/package/prosemirror-utils)

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
