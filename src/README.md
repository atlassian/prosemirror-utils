# Utils library for ProseMirror

## Quick Start

Install `prosemirror-utils` package from npm:

```sh
npm install prosemirror-utils
```

## Documentation

Getting the parent node based on the current cursor position:

@findParentNode

@findParentDomRef

@hasParentNode

@findParentNodeOfType

@hasParentNodeOfType

@findParentDomRefOfType

Getting descendants of a given node:

@flatten

@findChildren

@findTextNodes

@findInlineNodes

@findBlockNodes

@findChildrenByAttr

@findChildrenByType

@findChildrenByMark

@contains

Tables helpers:

@findTable

@isCellSelection

@isColumnSelected

@isRowSelected

@isTableSelected

@getCellsInColumn

@getCellsInRow

@getCellsInTable

Transforms:

@removeParentNodeOfType

@replaceParentNodeOfType

@removeSelectedNode

@safeInsert

## License

* **MIT** : http://opensource.org/licenses/MIT
