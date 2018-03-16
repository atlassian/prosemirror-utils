# Utils library for ProseMirror

## Quick Start

Install `prosemirror-utils` package from npm:

```sh
npm install prosemirror-utils
```

## Documentation

### Selection

* **`findParentNode`**`(predicate: fn(node: ProseMirrorNode) → boolean) → fn(selection: Selection) → ?{pos: number, node: ProseMirrorNode}`\
  Iterates over parent nodes, returning the first node and its position `predicate` returns truthy for.

- **`findParentDomRef`**`(predicate: fn(node: ProseMirrorNode) → boolean, domAtPos: fn(pos: number) → {node: dom.Node, offset: number}) → fn(selection: Selection) → ?dom.Node`\
  Iterates over parent nodes, returning DOM reference of the first node `predicate` returns truthy for.

* **`hasParentNode`**`(predicate: fn(node: ProseMirrorNode) → boolean) → fn(selection: Selection) → boolean`\
  Checks if there's a parent node `predicate` returns truthy for.

- **`findParentNodeOfType`**`(nodeType: NodeType | [NodeType]) → fn(selection: Selection) → ?{node: ProseMirrorNode, pos: number}`\
  Iterates over parent nodes, returning first node of the given `nodeType`.

* **`hasParentNodeOfType`**`(nodeType: NodeType | [NodeType]) → fn(selection: Selection) → boolean`\
  Checks if there's a parent node of the given `nodeType`.

- **`findParentDomRefOfType`**`(nodeType: NodeType | [NodeType], domAtPos: fn(pos: number) → {node: dom.Node, offset: number}) → fn(selection: Selection) → ?dom.Node`\
  Iterates over parent nodes, returning DOM reference of the first node of the given `nodeType`.

* **`findSelectedNodeOfType`**`(nodeType: NodeType | [NodeType]) → fn(selection: Selection) → ?ProseMirrorNode`\
  Returns a node of a given `nodeType` if its selected.

### Node

* **`flatten`**`(node: ProseMirrorNode, descend: ?boolean = true) → [{node: ProseMirrorNode, pos: number}]`\
  Flattens descendants of a given `node`. Doesn't descend into a `node` when `descend` argument is `false`. Defaults to `true`.

- **`findChildren`**`(node: ProseMirrorNode, predicate: fn(node: ProseMirrorNode) → boolean, descend: ?boolean) → [{node: ProseMirrorNode, pos: number}]`\
  Iterates over descendants of a given `node`, returning child nodes `predicate` returns truthy for. Doesn't descend into a `node` when `descend` argument is `false`.

* **`findTextNodes`**`(node: ProseMirrorNode, descend: ?boolean) → [{node: ProseMirrorNode, pos: number}]`\
  Returns text nodes of a given `node`. Doesn't descend into a `node` when `descend` argument is `false`.

- **`findInlineNodes`**`(node: ProseMirrorNode, descend: ?boolean) → [{node: ProseMirrorNode, pos: number}]`\
  Returns inline nodes of a given `node`. Doesn't descend into a `node` when `descend` argument is `false`.

* **`findBlockNodes`**`(node: ProseMirrorNode, descend: ?boolean) → [{node: ProseMirrorNode, pos: number}]`\
  Returns block descendants of a given `node`. Doesn't descend into a `node` when `descend` argument is `false`.

- **`findChildrenByAttr`**`(node: ProseMirrorNode, predicate: fn(attrs: ?Object) → boolean, descend: ?boolean) → [{node: ProseMirrorNode, pos: number}]`\
  Iterates over descendants of a given `node`, returning child nodes `predicate` returns truthy for. Doesn't descend into a `node` when `descend` argument is `false`.

* **`findChildrenByType`**`(node: ProseMirrorNode, nodeType: NodeType, descend: ?boolean) → [{node: ProseMirrorNode, pos: number}]`\
  Iterates over descendants of a given `node`, returning child nodes of a given `nodeType`. Doesn't descend into a `node` when `descend` argument is `false`.

- **`findChildrenByMark`**`(node: ProseMirrorNode, markType: markType, descend: ?boolean) → [{node: ProseMirrorNode, pos: number}]`\
  Iterates over descendants of a given `node`, returning child nodes that have a mark of a given `markType`. Doesn't descend into a `node` when `descend` argument is `false`.
  exapmle: `findChildrenByMark(paragraph, schema.marks.strong)`

* **`contains`**`(node: ProseMirrorNode, nodeType: NodeType) → boolean`\
  Returns `true` if a given `node` contains nodes of a given `nodeType`

### Tables

* **`findTable`**`(selection: Selection) → ?{pos: number, node: ProseMirrorNode}`\
  Iterates over parent nodes, returning the first found table node.

- **`isCellSelection`**`(selection: Selection) → boolean`\
  Checks if current selection is a CellSelection

* **`isColumnSelected`**`(columnIndex: number) → fn(selection: Selection) → boolean`\
  Checks if entire column at index `columnIndex` is selected

- **`isRowSelected`**`(rowIndex: number) → fn(selection: Selection) → boolean`\
  Checks if entire row at index `rowIndex` is selected

* **`isTableSelected`**`(selection: Selection) → boolean`\
  Checks if entire table is selected

- **`getCellsInColumn`**`(columnIndex: number) → fn(selection: Selection) → ?[{pos: number, node: ProseMirrorNode}]`\
  Returns an array of cells in a column at index `columnIndex`.

* **`getCellsInRow`**`(rowIndex: number) → fn(selection: Selection) → ?[{pos: number, node: ProseMirrorNode}]`\
  Returns an array of cells in a row at index `rowIndex`.

- **`getCellsInTable`**`(selection: Selection) → ?[{pos: number, node: ProseMirrorNode}]`\
  Returns an array of all cells in a table.

### Transforms

* **`removeParentNodeOfType`**`(nodeType: NodeType | [NodeType]) → fn(tr: Transaction) → Transaction`\
  Returns a new transaction that removes a node of a given `nodeType`.
  It will return the original transaction if parent node hasn't been found.

- **`replaceParentNodeOfType`**`(nodeType: NodeType | [NodeType], node: ProseMirrorNode) → fn(tr: Transaction) → Transaction`\
  Returns a new transaction that replaces parent node of a given `nodeType` with the given `node`.
  It will return the original transaction if parent node hasn't been found, or replacing is not possible.

* **`removeSelectedNode`**`(tr: Transaction) → Transaction`\
  Returns a new transaction that removes selected node.
  It will return the original transaction if current selection is not a NodeSelection

- **`replaceSelectedNode`**`(node: ProseMirrorNode) → fn(tr: Transaction) → Transaction`\
  Returns a new transaction that replaces selected node with a given `node`.
  It will return the original transaction if current selection is not a NodeSelection, or replacing is not possible.

* **`safeInsert`**`(node: ProseMirrorNode) → fn(tr: Transaction) → Transaction`\
  Returns a new transaction that inserts a given `node` at the current cursor position if it is allowed by schema. If schema restricts such nesting, it will try to find an appropriate place for a given `node` in the document, looping through parent nodes up until the root document node.
  It will return the original transaction if the place for insertion hasn't been found.

- **`setParentNodeMarkup`**`(nodeType: NodeType | [NodeType], type: ?NodeType | null, attrs: ?Object | null, marks: ?[Mark]) → fn(tr: Transaction) → Transaction`\
  Returns a transaction that changes the type, attributes, and/or marks of the parent node of a given `nodeType`.

## License

* **MIT** : http://opensource.org/licenses/MIT
