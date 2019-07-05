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

 * **`findParentNode`**`(predicate: fn(node: ProseMirrorNode) → boolean) → fn(selection: Selection) → ?{pos: number, start: number, depth: number, node: ProseMirrorNode}`\
   Iterates over parent nodes, returning the closest node and its start position `predicate` returns truthy for. `start` points to the start position of the node, `pos` points directly before the node.

   ```javascript
   const predicate = node => node.type === schema.nodes.blockquote;
   const parent = findParentNode(predicate)(selection);
   ```


 * **`findParentNodeClosestToPos`**`($pos: ResolvedPos, predicate: fn(node: ProseMirrorNode) → boolean) → ?{pos: number, start: number, depth: number, node: ProseMirrorNode}`\
   Iterates over parent nodes starting from the given `$pos`, returning the closest node and its start position `predicate` returns truthy for. `start` points to the start position of the node, `pos` points directly before the node.

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


 * **`findParentNodeOfType`**`(nodeType: NodeType | [NodeType]) → fn(selection: Selection) → ?{pos: number, start: number, depth: number, node: ProseMirrorNode}`\
   Iterates over parent nodes, returning closest node of a given `nodeType`. `start` points to the start position of the node, `pos` points directly before the node.

   ```javascript
   const parent = findParentNodeOfType(schema.nodes.paragraph)(selection);
   ```


 * **`findParentNodeOfTypeClosestToPos`**`($pos: ResolvedPos, nodeType: NodeType | [NodeType]) → ?{pos: number, start: number, depth: number, node: ProseMirrorNode}`\
   Iterates over parent nodes starting from the given `$pos`, returning closest node of a given `nodeType`. `start` points to the start position of the node, `pos` points directly before the node.

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


 * **`findSelectedNodeOfType`**`(nodeType: NodeType | [NodeType]) → fn(selection: Selection) → ?{pos: number, start: number, depth: number, node: ProseMirrorNode}`\
   Returns a node of a given `nodeType` if it is selected. `start` points to the start position of the node, `pos` points directly before the node.

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
   Returns DOM reference of a node at a given `position`. If the node type is of type `TEXT_NODE` it will return the reference of the parent node.

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

 * **`findTable`**`(selection: Selection) → ?{pos: number, start: number, node: ProseMirrorNode}`\
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


 * **`getCellsInColumn`**`(columnIndex: number | [number]) → fn(selection: Selection) → ?[{pos: number, start: number, node: ProseMirrorNode}]`\
   Returns an array of cells in a column(s), where `columnIndex` could be a column index or an array of column indexes.

   ```javascript
   const cells = getCellsInColumn(i)(selection); // [{node, pos}, {node, pos}]
   ```


 * **`getCellsInRow`**`(rowIndex: number | [number]) → fn(selection: Selection) → ?[{pos: number, start: number, node: ProseMirrorNode}]`\
   Returns an array of cells in a row(s), where `rowIndex` could be a row index or an array of row indexes.

   ```javascript
   const cells = getCellsInRow(i)(selection); // [{node, pos}, {node, pos}]
   ```


 * **`getCellsInTable`**`(selection: Selection) → ?[{pos: number, start: number, node: ProseMirrorNode}]`\
   Returns an array of all cells in a table.

   ```javascript
   const cells = getCellsInTable(selection); // [{node, pos}, {node, pos}]
   ```


 * **`selectColumn`**`(columnIndex: number, expand: ?boolean) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that creates a `CellSelection` on a column at index `columnIndex`.
   Use the optional `expand` param to extend from current selection.

   ```javascript
   dispatch(
     selectColumn(i)(state.tr)
   );
   ```


 * **`selectRow`**`(rowIndex: number, expand: ?boolean) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that creates a `CellSelection` on a column at index `rowIndex`.
   Use the optional `expand` param to extend from current selection.

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


 * **`moveRow`**`(originRowIndex: number, targetRowIndex: targetColumnIndex, options: ?MovementOptions) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that moves the origin row to the target index;

   by default "tryToFit" is false, that means if you try to move a row to a place
   where we will need to split a row with merged cells it'll throw an exception, for example:

   ```
        ____________________________
       |      |      |             |
    0  |  A1  |  B1  |     C1      |
       |______|______|______ ______|
       |      |             |      |
    1  |  A2  |     B2      |      |
       |______|______ ______|      |
       |      |      |      |  D1  |
    2  |  A3  |  B3  |  C2  |      |
       |______|______|______|______|
   ```

   if you try to move the row 0 to the row index 1 with tryToFit false,
   it'll throw an exception since you can't split the row 1;
   but if "tryToFit" is true, it'll move the row using the current direction.

   We defined current direction using the target and origin values
   if the origin is greater than the target, that means the course is `bottom-to-top`,
   so the `tryToFit` logic will use this direction to determine
   if we should move the column to the right or the left.

   for example, if you call the function using `moveRow(0, 1, { tryToFit: true })`
   the result will be:
   ```
        ____________________________
       |      |             |      |
    0  |  A2  |     B2      |      |
       |______|______ ______|      |
       |      |      |      |  D1  |
    1  |  A3  |  B3  |  C2  |      |
       |______|______|______|______|
       |      |      |             |
    2  |  A1  |  B1  |     C1      |
       |______|______|______ ______|
   ```

   since we could put the row zero on index one,
   we pushed to the best place to fit the row index 0,
   in this case, row index 2.


   -------- HOW TO OVERRIDE DIRECTION --------

   If you set "tryToFit" to "true", it will try to figure out the best direction
   place to fit using the origin and target index, for example:


   ```
        ____________________________
       |      |      |             |
    0  |  A1  |  B1  |     C1      |
       |______|______|______ ______|
       |      |             |      |
    1  |  A2  |     B2      |      |
       |______|______ ______|      |
       |      |      |      |  D1  |
    2  |  A3  |  B3  |  C2  |      |
       |______|______|______|______|
       |      |             |      |
    3  |  A4  |     B4      |      |
       |______|______ ______|      |
       |      |      |      |  D2  |
    4  |  A5  |  B5  |  C3  |      |
       |______|______|______|______|
   ```


   If you try to move the row 0 to row index 4 with "tryToFit" enabled, by default,
   the code will put it on after the merged rows,
   but you can override it using the "direction" option.

   -1: Always put the origin before the target
   ```
        ____________________________
       |      |             |      |
    0  |  A2  |     B2      |      |
       |______|______ ______|      |
       |      |      |      |  D1  |
    1  |  A3  |  B3  |  C2  |      |
       |______|______|______|______|
       |      |      |             |
    2  |  A1  |  B1  |     C1      |
       |______|______|______ ______|
       |      |             |      |
    3  |  A4  |     B4      |      |
       |______|______ ______|      |
       |      |      |      |  D2  |
    4  |  A5  |  B5  |  C3  |      |
       |______|______|______|______|
   ```

    0: Automatically decide the best place to fit
   ```
        ____________________________
       |      |             |      |
    0  |  A2  |     B2      |      |
       |______|______ ______|      |
       |      |      |      |  D1  |
    1  |  A3  |  B3  |  C2  |      |
       |______|______|______|______|
       |      |             |      |
    2  |  A4  |     B4      |      |
       |______|______ ______|      |
       |      |      |      |  D2  |
    3  |  A5  |  B5  |  C3  |      |
       |______|______|______|______|
       |      |      |             |
    4  |  A1  |  B1  |     C1      |
       |______|______|______ ______|
   ```

    1: Always put the origin after the target
   ```
        ____________________________
       |      |             |      |
    0  |  A2  |     B2      |      |
       |______|______ ______|      |
       |      |      |      |  D1  |
    1  |  A3  |  B3  |  C2  |      |
       |______|______|______|______|
       |      |             |      |
    2  |  A4  |     B4      |      |
       |______|______ ______|      |
       |      |      |      |  D2  |
    3  |  A5  |  B5  |  C3  |      |
       |______|______|______|______|
       |      |      |             |
    4  |  A1  |  B1  |     C1      |
       |______|______|______ ______|
   ```

   ```javascript
   dispatch(
     moveRow(x, y, options)(state.tr)
   );
   ```


 * **`moveColumn`**`(originColumnIndex: number, targetColumnIndex: targetColumnIndex, options: ?MovementOptions) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that moves the origin column to the target index;

   by default "tryToFit" is false, that means if you try to move a column to a place
   where we will need to split a column with merged cells it'll throw an exception, for example:

   ```
      0      1         2
    ____________________________
   |      |      |             |
   |  A1  |  B1  |     C1      |
   |______|______|______ ______|
   |      |             |      |
   |  A2  |     B2      |      |
   |______|______ ______|      |
   |      |      |      |  D1  |
   |  A3  |  B3  |  C2  |      |
   |______|______|______|______|
   ```


   if you try to move the column 0 to the column index 1 with tryToFit false,
   it'll throw an exception since you can't split the column 1;
   but if "tryToFit" is true, it'll move the column using the current direction.

   We defined current direction using the target and origin values
   if the origin is greater than the target, that means the course is `right-to-left`,
   so the `tryToFit` logic will use this direction to determine
   if we should move the column to the right or the left.

   for example, if you call the function using `moveColumn(0, 1, { tryToFit: true })`
   the result will be:

   ```
      0       1             2
   _____________________ _______
   |      |             |      |
   |  B1  |     C1      |  A1  |
   |______|______ ______|______|
   |             |      |      |
   |     B2      |      |  A2  |
   |______ ______|      |______|
   |      |      |  D1  |      |
   |  B3  |  C2  |      |  A3  |
   |______|______|______|______|
   ```

   since we could put the column zero on index one,
   we pushed to the best place to fit the column 0, in this case, column index 2.

   -------- HOW TO OVERRIDE DIRECTION --------

   If you set "tryToFit" to "true", it will try to figure out the best direction
   place to fit using the origin and target index, for example:


   ```
       0      1       2     3      4      5       6
     _________________________________________________
    |      |      |             |      |             |
    |  A1  |  B1  |     C1      |  E1  |     F1      |
    |______|______|______ ______|______|______ ______|
    |      |             |      |             |      |
    |  A2  |     B2      |      |     E2      |      |
    |______|______ ______|      |______ ______|      |
    |      |      |      |  D1  |      |      |  G2  |
    |  A3  |  B3  |  C3  |      |  E3  |  F3  |      |
    |______|______|______|______|______|______|______|
   ```


   If you try to move the column 0 to column index 5 with "tryToFit" enabled, by default,
   the code will put it on after the merged columns,
   but you can override it using the "direction" option.

   -1: Always put the origin before the target

   ```
       0      1       2     3      4      5       6
     _________________________________________________
    |      |             |      |      |             |
    |  B1  |     C1      |  A1  |  E1  |     F1      |
    |______|______ ______|______|______|______ ______|
    |             |      |      |             |      |
    |     B2      |      |  A2  |     E2      |      |
    |______ ______|      |______|______ ______|      |
    |      |      |  D1  |      |      |      |  G2  |
    |  B3  |  C3  |      |  A3  |  E3  |  F3  |      |
    |______|______|______|______|______|______|______|
   ```

    0: Automatically decide the best place to fit

   ```
       0      1       2     3      4      5       6
     _________________________________________________
    |      |             |      |             |      |
    |  B1  |     C1      |  E1  |     F1      |  A1  |
    |______|______ ______|______|______ ______|______|
    |             |      |             |      |      |
    |     B2      |      |     E2      |      |  A2  |
    |______ ______|      |______ ______|      |______|
    |      |      |  D1  |      |      |  G2  |      |
    |  B3  |  C3  |      |  E3  |  F3  |      |  A3  |
    |______|______|______|______|______|______|______|
   ```

    1: Always put the origin after the target

   ```
       0      1       2     3      4      5       6
     _________________________________________________
    |      |             |      |             |      |
    |  B1  |     C1      |  E1  |     F1      |  A1  |
    |______|______ ______|______|______ ______|______|
    |             |      |             |      |      |
    |     B2      |      |     E2      |      |  A2  |
    |______ ______|      |______ ______|      |______|
    |      |      |  D1  |      |      |  G2  |      |
    |  B3  |  C3  |      |  E3  |  F3  |      |  A3  |
    |______|______|______|______|______|______|______|
   ```

   ```javascript
   dispatch(
     moveColumn(x, y, options)(state.tr)
   );
   ```


 * **`addRowAt`**`(rowIndex: number, clonePreviousRow: ?boolean) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that adds a new row at index `rowIndex`. Optionally clone the previous row.

   ```javascript
   dispatch(
     addRowAt(i)(state.tr)
   );
   ```

   ```javascript
   dispatch(
     addRowAt(i, true)(state.tr)
   );
   ```


 * **`cloneRowAt`**`(cloneRowIndex: number) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that adds a new row after `cloneRowIndex`, cloning the row attributes at `cloneRowIndex`.

   ```javascript
   dispatch(
     cloneRowAt(i)(state.tr)
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


 * **`findCellClosestToPos`**`($pos: ResolvedPos) → ?{pos: number, start: number, node: ProseMirrorNode}`\
   Iterates over parent nodes, returning a table cell or a table header node closest to a given `$pos`.

   ```javascript
   const cell = findCellClosestToPos(state.selection.$from);
   ```


 * **`findCellRectClosestToPos`**`($pos: ResolvedPos) → ?{left: number, top: number, right: number, bottom: number}`\
   Returns the rectangle spanning a cell closest to a given `$pos`.

   ```javascript
   dispatch(
     findCellRectClosestToPos(state.selection.$from)
   );
   ```


 * **`forEachCellInColumn`**`(columnIndex: number, cellTransform: fn(cell: {pos: number, start: number, node: ProseMirrorNode}, tr: Transaction) → Transaction, setCursorToLastCell: ?boolean) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that maps a given `cellTransform` function to each cell in a column at a given `columnIndex`.
   It will set the selection into the last cell of the column if `setCursorToLastCell` param is set to `true`.

   ```javascript
   dispatch(
     forEachCellInColumn(0, (cell, tr) => emptyCell(cell, state.schema)(tr))(state.tr)
   );
   ```


 * **`forEachCellInRow`**`(rowIndex: number, cellTransform: fn(cell: {pos: number, start: number, node: ProseMirrorNode}, tr: Transaction) → Transaction, setCursorToLastCell: ?boolean) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that maps a given `cellTransform` function to each cell in a row at a given `rowIndex`.
   It will set the selection into the last cell of the row if `setCursorToLastCell` param is set to `true`.

   ```javascript
   dispatch(
     forEachCellInRow(0, (cell, tr) => setCellAttrs(cell, { background: 'red' })(tr))(state.tr)
   );
   ```


 * **`setCellAttrs`**`(cell: {pos: number, start: number, node: ProseMirrorNode}, attrs: Object) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that sets given `attrs` to a given `cell`.

   ```javascript
   dispatch(
     setCellAttrs(findCellClosestToPos($pos), { background: 'blue' })(tr);
   );
   ```


 * **`createTable`**`(schema: Schema, rowsCount: ?number = 3, colsCount: ?number = 3, withHeaderRow: ?boolean = true, cellContent: ?Node = null) → Node`\
   Returns a table node of a given size.
   `withHeaderRow` defines whether the first row of the table will be a header row.
   `cellContent` defines the content of each cell.

   ```javascript
   const table = createTable(state.schema); // 3x3 table node
   dispatch(
     tr.replaceSelectionWith(table).scrollIntoView()
   );
   ```


 * **`getSelectionRect`**`(selection: Selection) → ?{left: number, right: number, top: number, bottom: number}`\
   Get the selection rectangle. Returns `undefined` if selection is not a CellSelection.

   ```javascript
   const rect = getSelectionRect(selection);
   ```


 * **`getSelectionRangeInColumn`**`(columnIndex: number) → fn(tr: Transaction) → {$anchor: ResolvedPos, $head: ResolvedPos, indexes: [number]}`\
   Returns a range of rectangular selection spanning all merged cells around a column at index `columnIndex`.

   ```javascript
   const range = getSelectionRangeInColumn(3)(state.tr);
   ```


 * **`getSelectionRangeInRow`**`(rowIndex: number) → fn(tr: Transaction) → {$anchor: ResolvedPos, $head: ResolvedPos, indexes: [number]}`\
   Returns a range of rectangular selection spanning all merged cells around a row at index `rowIndex`.

   ```javascript
   const range = getSelectionRangeInRow(3)(state.tr);
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


 * **`replaceSelectedNode`**`(content: ProseMirrorNode | ProseMirrorFragment) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that replaces selected node with a given `node`, keeping NodeSelection on the new `node`.
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


 * **`safeInsert`**`(content: ProseMirrorNode | Fragment, position: ?number, tryToReplace: ?boolean) → fn(tr: Transaction) → Transaction`\
   Returns a new transaction that inserts a given `content` at the current cursor position, or at a given `position`, if it is allowed by schema. If schema restricts such nesting, it will try to find an appropriate place for a given node in the document, looping through parent nodes up until the root document node.
   If `tryToReplace` is true and current selection is a NodeSelection, it will replace selected node with inserted content if its allowed by schema.
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


 * **`convertTableNodeToArrayOfRows`**`(tableNode: Node) → [Node]`\
   This function will transform the table node
   into a matrix of rows and columns respecting merged cells,
   for example this table will be convert to the below:

   ```
    ____________________________
   |      |      |             |
   |  A1  |  B1  |     C1      |
   |______|______|______ ______|
   |      |             |      |
   |  A2  |     B2      |      |
   |______|______ ______|      |
   |      |      |      |  D1  |
   |  A3  |  B3  |  C2  |      |
   |______|______|______|______|
   ```


   ```javascript
   array = [
     [A1, B1, C1, null],
     [A2, B2, null, D1],
     [A3. B3, C2, null],
   ]
   ```


 * **`convertArrayOfRowsToTableNode`**`(tableNode: Node, tableArray: [Node]) → Node`\
   This function will transform a matrix of nodes
   into table node respecting merged cells and rows configurations,
   for example this array will be convert to the table below:

   ```javascript
   array = [
     [A1, B1, C1, null],
     [A2, B2, null, D1],
     [A3. B3, C2, null],
   ]
   ```

   ```
    ____________________________
   |      |      |             |
   |  A1  |  B1  |     C1      |
   |______|______|______ ______|
   |      |             |      |
   |  A2  |     B2      |      |
   |______|______ ______|      |
   |      |      |      |  D1  |
   |  A3  |  B3  |  C2  |      |
   |______|______|______|______|
   ```


## License

* **Apache 2.0** : http://www.apache.org/licenses/LICENSE-2.0

