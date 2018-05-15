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

## Public API documentation

### Utils for working with `selection`

 * **`findParentNode`**`(predicate: fn(node: ProseMirrorNode) → boolean) → fn(selection: Selection) → ?{pos: number, node: ProseMirrorNode}`\
   Iterates over parent nodes, returning the closest node and its start position `predicate` returns truthy for.

   ```javascript
   const predicate = node => node.type === schema.nodes.blockquote;
   const parent = findParentNode(predicate)(selection);
   ```


 * **`findParentNodeClosestToPos`**`($pos: ResolvedPos, predicate: fn(node: ProseMirrorNode) → boolean) → ?{pos: number, node: ProseMirrorNode}`\
   Iterates over parent nodes starting from the given `$pos`, returning the closest node and its start position `predicate` returns truthy for.

   ```javascript
   const predicate = node => node.type === schema.nodes.blockquote;
   const parent = findParentNodeClosestToPos(state.doc.resolve(5), predicate);
   ```


 * **`findParentDomRef`**`(predicate: fn(node: ProseMirrorNode) → boolean, domAtPos: fn(pos: number) → {node: dom.Node, offset: number}) → fn(selection: Selection) → ?dom.Node`\
   Iterates over parent nodes, returning DOM reference of the closest node `predicate` returns truthy for.

   ```javascript
   const domAtPos = view.domAtPos.bind(view);
   const predicate = node => node.type === schema.nodes.table;
   const parent = findParentDomRef(predicate, domAtPos)(selection); // <table>
   ```


 * **`hasParentNode`**`(predicate: fn(node: ProseMirrorNode) → boolean) → fn(selection: Selection) → boolean`\
   Checks if there's a parent node `predicate` returns truthy for.

   ```javascript
   if (hasParentNode(node => node.type === schema.nodes.table)(selection)) {
     // ....
   }
   ```


 * **`findParentNodeOfType`**`(nodeType: NodeType | [NodeType]) → fn(selection: Selection) → ?{node: ProseMirrorNode, pos: number}`\
   Iterates over parent nodes, returning closest node of a given `nodeType`.

   ```javascript
   const parent = findParentNodeOfType(schema.nodes.paragraph)(selection);
   ```


 * **`findParentNodeOfTypeClosestToPos`**`($pos: ResolvedPos, nodeType: NodeType | [NodeType]) → ?{node: ProseMirrorNode, pos: number}`\
   Iterates over parent nodes starting from the given `$pos`, returning closest node of a given `nodeType`.

   ```javascript
   const parent = findParentNodeOfTypeClosestToPos(state.doc.resolve(10), schema.nodes.paragraph);
   ```


 * **`hasParentNodeOfType`**`(nodeType: NodeType | [NodeType]) → fn(selection: Selection) → boolean`\
   Checks if there's a parent node of a given `nodeType`.

   ```javascript
   if (hasParentNodeOfType(schema.nodes.table)(selection)) {
     // ....
   }
   ```


 * **`findParentDomRefOfType`**`(nodeType: NodeType | [NodeType], domAtPos: fn(pos: number) → {node: dom.Node, offset: number}) → fn(selection: Selection) → ?dom.Node`\
   Iterates over parent nodes, returning DOM reference of the closest node of a given `nodeType`.

   ```javascript
   const domAtPos = view.domAtPos.bind(view);
   const parent = findParentDomRefOfType(schema.nodes.codeBlock, domAtPos)(selection); // <pre>
   ```


 * **`findSelectedNodeOfType`**`(nodeType: NodeType | [NodeType]) → fn(selection: Selection) → ?{node: ProseMirrorNode, pos: number}`\
   Returns a node of a given `nodeType` if it is selected.

   ```javascript
   const { extension, inlineExtension, bodiedExtension } = schema.nodes;
   const selectedNode = findSelectedNodeOfType([
     extension,
     inlineExtension,
     bodiedExtension,
   ])(selection);
   ```


 * **`isNodeSelection`**`(selection: Selection) → boolean`\
   Checks if current selection is a `NodeSelection`.

   ```javascript
   if (isNodeSelection(tr.selection)) {
     // ...
   }
   ```


 * **`findPositionOfNodeBefore`**`(selection: Selection) → ?number`\
   Returns position of the previous node.

   ```javascript
   const pos = findPositionOfNodeBefore(tr.selection);
   ```


 * **`findDomRefAtPos`**`(position: number, domAtPos: fn(pos: number) → {node: dom.Node, offset: number}) → dom.Node`\
   Returns DOM reference of a node at a given `position`.
   @see https://github.com/atlassian/prosemirror-utils/issues/8 for more context.

   ```javascript
   const domAtPos = view.domAtPos.bind(view);
   const ref = findDomRefAtPos($from.pos, domAtPos);
   ```


### Utils for working with ProseMirror `node`

 * **`flatten`**`(node: ProseMirrorNode, descend: ?boolean = true) → [{node: ProseMirrorNode, pos: number}]`\
   Flattens descendants of a given `node`. It doesn't descend into a node when descend argument is `false` (defaults to `true`).

   ```javascript
   const children = flatten(node);
   ```


 * **`findChildren`**`(node: ProseMirrorNode, predicate: fn(node: ProseMirrorNode) → boolean, descend: ?boolean) → [{node: ProseMirrorNode, pos: number}]`\
   Iterates over descendants of a given `node`, returning child nodes predicate returns truthy for. It doesn't descend into a node when descend argument is `false` (defaults to `true`).

   ```javascript
   const textNodes = findChildren(node, child => child.isText, false);
   ```


 * **`findTextNodes`**`(node: ProseMirrorNode, descend: ?boolean) → [{node: ProseMirrorNode, pos: number}]`\
   Returns text nodes of a given `node`. It doesn't descend into a node when descend argument is `false` (defaults to `true`).

   ```javascript
   const textNodes = findTextNodes(node);
   ```


 * **`findInlineNodes`**`(node: ProseMirrorNode, descend: ?boolean) → [{node: ProseMirrorNode, pos: number}]`\
   Returns inline nodes of a given `node`. It doesn't descend into a node when descend argument is `false` (defaults to `true`).

   ```javascript
   const inlineNodes = findInlineNodes(node);
   ```


 * **`findBlockNodes`**`(node: ProseMirrorNode, descend: ?boolean) → [{node: ProseMirrorNode, pos: number}]`\
   Returns block descendants of a given `node`. It doesn't descend into a node when descend argument is `false` (defaults to `true`).

   ```javascript
   const blockNodes = findBlockNodes(node);
   ```


 * **`findChildrenByAttr`**`(node: ProseMirrorNode, predicate: fn(attrs: ?Object) → boolean, descend: ?boolean) → [{node: ProseMirrorNode, pos: number}]`\
   Iterates over descendants of a given `node`, returning child nodes predicate returns truthy for. It doesn't descend into a node when descend argument is `false` (defaults to `true`).

   ```javascript
   const mergedCells = findChildrenByAttr(table, attrs => attrs.colspan === 2);
   ```


 * **`findChildrenByType`**`(node: ProseMirrorNode, nodeType: NodeType, descend: ?boolean) → [{node: ProseMirrorNode, pos: number}]`\
   Iterates over descendants of a given `node`, returning child nodes of a given nodeType. It doesn't descend into a node when descend argument is `false` (defaults to `true`).

   ```javascript
   const cells = findChildrenByType(table, schema.nodes.tableCell);
   ```


 * **`findChildrenByMark`**`(node: ProseMirrorNode, markType: markType, descend: ?boolean) → [{node: ProseMirrorNode, pos: number}]`\
   Iterates over descendants of a given `node`, returning child nodes that have a mark of a given markType. It doesn't descend into a `node` when descend argument is `false` (defaults to `true`).

   ```javascript
   const nodes = findChildrenByMark(state.doc, schema.marks.strong);
   ```


 * **`contains`**`(node: ProseMirrorNode, nodeType: NodeType) → boolean`\
   Returns `true` if a given node contains nodes of a given `nodeType`

   ```javascript
   if (contains(panel, schema.nodes.listItem)) {
     // ...
   }
   ```


### Utils for working with `table`

 * **`findTable`**`(selection: Selection) → ?{pos: number, node: ProseMirrorNode}`\
   Iterates over parent nodes, returning the closest table node.

   ```javascript
   const table = findTable(selection);
   ```


 * **`isCellSelection`**`(selection: Selection) → boolean`\
   Checks if current selection is a `CellSelection`.

   ```javascript
   if (isCellSelection(selection)) {
     // ...
   }
   ```


 * **`isColumnSelected`**`(columnIndex: number) → fn(selection: Selection) → boolean`\
   Checks if entire column at index `columnIndex` is selected.

   ```javascript
   const className = isColumnSelected(i)(selection) ? 'selected' : '';
   ```


 * **`isRowSelected`**`(rowIndex: number) → fn(selection: Selection) → boolean`\
   Checks if entire row at index `rowIndex` is selected.

   ```javascript
   const className = isRowSelected(i)(selection) ? 'selected' : '';
   ```


 * **`isTableSelected`**`(selection: Selection) → boolean`\
   Checks if entire table is selected

   ```javascript
   const className = isTableSelected(selection) ? 'selected' : '';
   ```


 * **`getCellsInColumn`**`(columnIndex: number) → fn(selection: Selection) → ?[{pos: number, node: ProseMirrorNode}]`\
   Returns an array of cells in a column at index `columnIndex`.

   ```javascript
   const cells = getCellsInColumn(i)(selection); // [{node, pos}, {node, pos}]
   ```


 * **`getCellsInRow`**`(rowIndex: number) → fn(selection: Selection) → ?[{pos: number, node: ProseMirrorNode}]`\
   Returns an array of cells in a row at index `rowIndex`.

   ```javascript
   const cells = getCellsInRow(i)(selection); // [{node, pos}, {node, pos}]
   ```


 * **`getCellsInTable`**`(selection: Selection) → ?[{pos: number, node: ProseMirrorNode}]`\
   Returns an array of all cells in a table.

   ```javascript
   const cells = getCellsInTable(selection); // [{node, pos}, {node, pos}]
   ```


 * **`selectColumn`**`(columnIndex: number) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that creates a `CellSelection` on a column at index `columnIndex`.

   ```javascript
   dispatch(
     selectColumn(i)(state.tr)
   );
   ```


 * **`selectRow`**`(rowIndex: number) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that creates a `CellSelection` on a column at index `rowIndex`.

   ```javascript
   dispatch(
     selectRow(i)(state.tr)
   );
   ```


 * **`selectTable`**`(selection: Selection) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that creates a `CellSelection` on the entire table.

   ```javascript
   dispatch(
     selectTable(i)(state.tr)
   );
   ```


 * **`emptyCell`**`(cell: {pos: number, node: ProseMirrorNode}, schema: Schema) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that clears the content of a given `cell`.

   ```javascript
   const $pos = state.doc.resolve(13);
   dispatch(
     emptyCell(findCellClosestToPos($pos), state.schema)(state.tr)
   );
   ```


 * **`addColumnAt`**`(columnIndex: number) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that adds a new column at index `columnIndex`.

   ```javascript
   dispatch(
     addColumnAt(i)(state.tr)
   );
   ```


 * **`addRowAt`**`(rowIndex: number) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that adds a new row at index `rowIndex`.

   ```javascript
   dispatch(
     addRowAt(i)(state.tr)
   );
   ```


 * **`removeColumnAt`**`(columnIndex: number) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that removes a column at index `columnIndex`. If there is only one column left, it will remove the entire table.

   ```javascript
   dispatch(
     removeColumnAt(i)(state.tr)
   );
   ```


 * **`removeRowAt`**`(rowIndex: number) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that removes a row at index `rowIndex`. If there is only one row left, it will remove the entire table.

   ```javascript
   dispatch(
     removeRowAt(i)(state.tr)
   );
   ```


 * **`removeTable`**`(tr: Transaction) → Transaction`\
   Returns a new transaction that removes a table node if the cursor is inside of it.

   ```javascript
   dispatch(
     removeTable(state.tr)
   );
   ```


 * **`removeSelectedColumns`**`(tr: Transaction) → Transaction`\
   Returns a new transaction that removes selected columns.

   ```javascript
   dispatch(
     removeSelectedColumns(state.tr)
   );
   ```


 * **`removeSelectedRows`**`(tr: Transaction) → Transaction`\
   Returns a new transaction that removes selected rows.

   ```javascript
   dispatch(
     removeSelectedRows(state.tr)
   );
   ```


 * **`removeColumnClosestToPos`**`($pos: ResolvedPos) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that removes a column closest to a given `$pos`.

   ```javascript
   dispatch(
     removeColumnClosestToPos(state.doc.resolve(3))(state.tr)
   );
   ```


 * **`removeRowClosestToPos`**`($pos: ResolvedPos) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that removes a row closest to a given `$pos`.

   ```javascript
   dispatch(
     removeRowClosestToPos(state.doc.resolve(3))(state.tr)
   );
   ```


 * **`findCellClosestToPos`**`($pos: ResolvedPos) → ?{pos: number, node: ProseMirrorNode}`\
   Iterates over parent nodes, returning a table cell or a table header node closest to a given `$pos`.

   ```javascript
   const cell = findCellClosestToPos(state.doc.resolve(10));
   ```


 * **`forEachCellInColumn`**`(columnIndex: number, cellTransform: fn(cell: {pos: number, node: ProseMirrorNode}) → fn(tr: Transaction))`\
   , setCursorToLastCell: ?boolean) → (tr: Transaction) → Transaction
   Returns a new transaction that maps a given `cellTransform` function to each cell in a column at a given `columnIndex`.
   It will set the selection into the last cell of the column if `setCursorToLastCell` param is set to `true`.

   ```javascript
   dispatch(
     forEachCellInColumn(0, (cell, tr) => emptyCell(cell, state.schema)(tr))(state.tr)
   );
   ```


 * **`forEachCellInRow`**`(rowIndex: number, cellTransform: fn(cell: {pos: number, node: ProseMirrorNode}) → fn(tr: Transaction))`\
   , setCursorToLastCell: ?boolean) → (tr: Transaction) → Transaction
   Returns a new transaction that maps a given `cellTransform` function to each cell in a row at a given `rowIndex`.
   It will set the selection into the last cell of the row if `setCursorToLastCell` param is set to `true`.

   ```javascript
   dispatch(
     forEachCellInRow(0, (cell, tr) => setCellAttrs(cell, { background: 'red' })(tr))(state.tr)
   );
   ```


 * **`setCellAttrs`**`(cell: {pos: number, node: ProseMirrorNode}, attrs: Object) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that sets given `attrs` to a given `cell`.

   ```javascript
   dispatch(
     setCellAttrs(findCellClosestToPos($pos), { background: 'blue' })(tr);
   );
   ```


### Utils for document transformation

 * **`removeParentNodeOfType`**`(nodeType: NodeType | [NodeType]) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that removes a node of a given `nodeType`. It will return an original transaction if parent node hasn't been found.

   ```javascript
   dispatch(
     removeParentNodeOfType(schema.nodes.table)(tr)
   );
   ```


 * **`replaceParentNodeOfType`**`(nodeType: NodeType | [NodeType], content: ProseMirrorNode | Fragment) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that replaces parent node of a given `nodeType` with the given `content`. It will return an original transaction if either parent node hasn't been found or replacing is not possible.

   ```javascript
   const node = schema.nodes.paragraph.createChecked({}, schema.text('new'));

   dispatch(
    replaceParentNodeOfType(schema.nodes.table, node)(tr)
   );
   ```


 * **`removeSelectedNode`**`(tr: Transaction) → Transaction`\
   Returns a new transaction that removes selected node. It will return an original transaction if current selection is not a `NodeSelection`.

   ```javascript
   dispatch(
     removeSelectedNode(tr)
   );
   ```


 * **`replaceSelectedNode`**`(node: ProseMirrorNode) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that replaces selected node with a given `node`.
   It will return the original transaction if either current selection is not a NodeSelection or replacing is not possible.

   ```javascript
   const node = schema.nodes.paragraph.createChecked({}, schema.text('new'));
   dispatch(
     replaceSelectedNode(node)(tr)
   );
   ```


 * **`canInsert`**`($pos: ResolvedPos, content: ProseMirrorNode | Fragment) → boolean`\
   Checks if a given `content` can be inserted at the given `$pos`

   ```javascript
   const { selection: { $from } } = state;
   const node = state.schema.nodes.atom.createChecked();
   if (canInsert($from, node)) {
     // ...
   }
   ```


 * **`safeInsert`**`(content: ProseMirrorNode | Fragment, position: ?number) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that inserts a given `content` at the current cursor position, or at a given `position`, if it is allowed by schema. If schema restricts such nesting, it will try to find an appropriate place for a given node in the document, looping through parent nodes up until the root document node.
   If cursor is inside of an empty paragraph, it will try to replace that paragraph with the given content. If insertion is successful and inserted node has content, it will set cursor inside of that content.
   It will return an original transaction if the place for insertion hasn't been found.

   ```javascript
   const node = schema.nodes.extension.createChecked({});
   dispatch(
     safeInsert(node)(tr)
   );
   ```


 * **`setParentNodeMarkup`**`(nodeType: NodeType | [NodeType], type: ?NodeType | null, attrs: ?Object | null, marks: ?[Mark]) → fn(tr: Transaction) → Transaction`\
   Returns a transaction that changes the type, attributes, and/or marks of the parent node of a given `nodeType`.

   ```javascript
   const node = schema.nodes.extension.createChecked({});
   dispatch(
     setParentNodeMarkup(schema.nodes.panel, null, { panelType })(tr);
   );
   ```


 * **`selectParentNodeOfType`**`(nodeType: NodeType | [NodeType]) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that sets a `NodeSelection` on a parent node of a `given nodeType`.

   ```javascript
   dispatch(
     selectParentNodeOfType([tableCell, tableHeader])(state.tr)
   );
   ```


 * **`removeNodeBefore`**`(tr: Transaction) → Transaction`\
   Returns a new transaction that deletes previous node.

   ```javascript
   dispatch(
     removeNodeBefore(state.tr)
   );
   ```


 * **`setTextSelection`**`(position: number, dir: ?number = 1) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that tries to find a valid cursor selection starting at the given `position`
   and searching back if `dir` is negative, and forward if positive.
   If a valid cursor position hasn't been found, it will return the original transaction.

   ```javascript
   dispatch(
     setTextSelection(5)(tr)
   );
   ```


## License

* **Apache 2.0** : http://www.apache.org/licenses/LICENSE-2.0

