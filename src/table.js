import {
  CellSelection,
  TableMap,
  addColumn,
  addRow,
  removeColumn,
  removeRow
} from 'prosemirror-tables';
import { Selection } from 'prosemirror-state';
import { Slice } from 'prosemirror-model';
import { findParentNode, findParentNodeClosestToPos } from './selection';
import { setTextSelection, safeInsert } from './transforms';
import { cloneTr, tableNodeTypes, findTableClosestToPos } from './helpers';

// :: (selection: Selection) → ?{pos: number, start: number, node: ProseMirrorNode}
// Iterates over parent nodes, returning the closest table node.
//
// ```javascript
// const table = findTable(selection);
// ```
export const findTable = selection =>
  findParentNode(
    node => node.type.spec.tableRole && node.type.spec.tableRole === 'table'
  )(selection);

// :: (selection: Selection) → boolean
// Checks if current selection is a `CellSelection`.
//
// ```javascript
// if (isCellSelection(selection)) {
//   // ...
// }
// ```
export const isCellSelection = selection => {
  return selection instanceof CellSelection;
};

// :: (columnIndex: number) → (selection: Selection) → boolean
// Checks if entire column at index `columnIndex` is selected.
//
// ```javascript
// const className = isColumnSelected(i)(selection) ? 'selected' : '';
// ```
export const isColumnSelected = columnIndex => selection => {
  if (isCellSelection(selection)) {
    const { $anchorCell, $headCell } = selection;
    const start = $anchorCell.start(-1);
    const map = TableMap.get($anchorCell.node(-1));
    const anchor = map.colCount($anchorCell.pos - start);
    const head = map.colCount($headCell.pos - start);

    return (
      selection.isColSelection() &&
      (columnIndex <= Math.max(anchor, head) &&
        columnIndex >= Math.min(anchor, head))
    );
  }

  return false;
};

// :: (rowIndex: number) → (selection: Selection) → boolean
// Checks if entire row at index `rowIndex` is selected.
//
// ```javascript
// const className = isRowSelected(i)(selection) ? 'selected' : '';
// ```
export const isRowSelected = rowIndex => selection => {
  if (isCellSelection(selection)) {
    const { $anchorCell, $headCell } = selection;
    const anchor = $anchorCell.index(-1);
    const head = $headCell.index(-1);

    return (
      selection.isRowSelection() &&
      (rowIndex <= Math.max(anchor, head) && rowIndex >= Math.min(anchor, head))
    );
  }

  return false;
};

// :: (selection: Selection) → boolean
// Checks if entire table is selected
//
// ```javascript
// const className = isTableSelected(selection) ? 'selected' : '';
// ```
export const isTableSelected = selection => {
  if (isCellSelection(selection)) {
    return selection.isColSelection() && selection.isRowSelection();
  }

  return false;
};

// :: (columnIndex: number) → (selection: Selection) → ?[{pos: number, start: number, node: ProseMirrorNode}]
// Returns an array of cells in a column at index `columnIndex`.
//
// ```javascript
// const cells = getCellsInColumn(i)(selection); // [{node, pos}, {node, pos}]
// ```
export const getCellsInColumn = columnIndex => selection => {
  const table = findTable(selection);
  if (table) {
    const map = TableMap.get(table.node);
    if (columnIndex >= 0 && columnIndex <= map.width - 1) {
      const cells = map.cellsInRect({
        left: columnIndex,
        right: columnIndex + 1,
        top: 0,
        bottom: map.height
      });
      return cells.map(nodePos => {
        const node = table.node.nodeAt(nodePos);
        const pos = nodePos + table.start;
        return { pos, start: pos + 1, node };
      });
    }
  }
};

// :: (rowIndex: number) → (selection: Selection) → ?[{pos: number, start: number, node: ProseMirrorNode}]
// Returns an array of cells in a row at index `rowIndex`.
//
// ```javascript
// const cells = getCellsInRow(i)(selection); // [{node, pos}, {node, pos}]
// ```
export const getCellsInRow = rowIndex => selection => {
  const table = findTable(selection);
  if (table) {
    const map = TableMap.get(table.node);
    if (rowIndex >= 0 && rowIndex <= map.height - 1) {
      const cells = map.cellsInRect({
        left: 0,
        right: map.width,
        top: rowIndex,
        bottom: rowIndex + 1
      });
      return cells.map(nodePos => {
        const node = table.node.nodeAt(nodePos);
        const pos = nodePos + table.start;
        return { pos, start: pos + 1, node };
      });
    }
  }
};

// :: (selection: Selection) → ?[{pos: number, start: number, node: ProseMirrorNode}]
// Returns an array of all cells in a table.
//
// ```javascript
// const cells = getCellsInTable(selection); // [{node, pos}, {node, pos}]
// ```
export const getCellsInTable = selection => {
  const table = findTable(selection);
  if (table) {
    const map = TableMap.get(table.node);
    const cells = map.cellsInRect({
      left: 0,
      right: map.width,
      top: 0,
      bottom: map.height
    });
    return cells.map(nodePos => {
      const node = table.node.nodeAt(nodePos);
      const pos = nodePos + table.start;
      return { pos, start: pos + 1, node };
    });
  }
};

// :: (columnIndex: number) → (tr: Transaction) → Transaction
// Returns a new transaction that creates a `CellSelection` on a column at index `columnIndex`.
//
// ```javascript
// dispatch(
//   selectColumn(i)(state.tr)
// );
// ```
export const selectColumn = columnIndex => tr => {
  const cells = getCellsInColumn(columnIndex)(tr.selection);
  if (cells) {
    const $anchor = tr.doc.resolve(cells[0].pos);
    const $head = tr.doc.resolve(cells[cells.length - 1].pos);
    return cloneTr(tr.setSelection(new CellSelection($anchor, $head)));
  }
  return tr;
};

// :: (rowIndex: number) → (tr: Transaction) → Transaction
// Returns a new transaction that creates a `CellSelection` on a column at index `rowIndex`.
//
// ```javascript
// dispatch(
//   selectRow(i)(state.tr)
// );
// ```
export const selectRow = rowIndex => tr => {
  const cells = getCellsInRow(rowIndex)(tr.selection);
  if (cells) {
    const $anchor = tr.doc.resolve(cells[0].pos);
    const $head = tr.doc.resolve(cells[cells.length - 1].pos);
    return cloneTr(tr.setSelection(new CellSelection($anchor, $head)));
  }
  return tr;
};

// :: (selection: Selection) → (tr: Transaction) → Transaction
// Returns a new transaction that creates a `CellSelection` on the entire table.
//
// ```javascript
// dispatch(
//   selectTable(i)(state.tr)
// );
// ```
export const selectTable = tr => {
  const cells = getCellsInTable(tr.selection);
  if (cells) {
    const $anchor = tr.doc.resolve(cells[0].pos);
    const $head = tr.doc.resolve(cells[cells.length - 1].pos);
    return cloneTr(tr.setSelection(new CellSelection($anchor, $head)));
  }
  return tr;
};

// :: (cell: {pos: number, node: ProseMirrorNode}, schema: Schema) → (tr: Transaction) → Transaction
// Returns a new transaction that clears the content of a given `cell`.
//
// ```javascript
// const $pos = state.doc.resolve(13);
// dispatch(
//   emptyCell(findCellClosestToPos($pos), state.schema)(state.tr)
// );
// ```
export const emptyCell = (cell, schema) => tr => {
  if (cell) {
    const content = tableNodeTypes(schema).cell.createAndFill().content;
    if (!cell.node.content.eq(content)) {
      tr.replaceWith(
        cell.pos,
        cell.pos + cell.node.nodeSize - 1,
        new Slice(content, 0, 0)
      );
      return cloneTr(tr);
    }
  }
  return tr;
};

// :: (columnIndex: number) → (tr: Transaction) → Transaction
// Returns a new transaction that adds a new column at index `columnIndex`.
//
// ```javascript
// dispatch(
//   addColumnAt(i)(state.tr)
// );
// ```
export const addColumnAt = columnIndex => tr => {
  const table = findTable(tr.selection);
  if (table) {
    const map = TableMap.get(table.node);
    if (columnIndex >= 0 && columnIndex <= map.width) {
      return cloneTr(
        addColumn(
          tr,
          {
            map,
            tableStart: table.start,
            table: table.node
          },
          columnIndex
        )
      );
    }
  }
  return tr;
};

// :: (rowIndex: number, clonePreviousRow?: boolean) → (tr: Transaction) → Transaction
// Returns a new transaction that adds a new row at index `rowIndex`. Optionally clone the previous row.
//
// ```javascript
// dispatch(
//   addRowAt(i)(state.tr)
// );
// ```
//
// ```javascript
// dispatch(
//   addRowAt(i, true)(state.tr)
// );
// ```
export const addRowAt = (rowIndex, clonePreviousRow) => tr => {
  const table = findTable(tr.selection);
  if (table) {
    const map = TableMap.get(table.node);
    const cloneRowIndex = rowIndex - 1;

    if (clonePreviousRow && cloneRowIndex >= 1 && cloneRowIndex <= map.height) {
      return cloneTr(cloneRowAt(cloneRowIndex)(tr));
    }

    if (rowIndex >= 0 && rowIndex <= map.height) {
      return cloneTr(
        addRow(
          tr,
          {
            map,
            tableStart: table.start,
            table: table.node
          },
          rowIndex
        )
      );
    }
  }
  return tr;
};

// :: (cloneRowIndex: number) → (tr: Transaction) → Transaction
// Returns a new transaction that adds a new row after `cloneRowIndex`, cloning the row attributes at `cloneRowIndex`.
//
// ```javascript
// dispatch(
//   cloneRowAt(i)(state.tr)
// );
// ```
export const cloneRowAt = rowIndex => tr => {
  const table = findTable(tr.selection);
  if (table) {
    const map = TableMap.get(table.node);

    if (rowIndex >= 1 && rowIndex <= map.height) {
      const tableNode = table.node;
      const tableNodes = tableNodeTypes(tableNode.type.schema);

      let rowPos = table.start;
      for (let i = 0; i < rowIndex + 1; i++) {
        rowPos += tableNode.child(i).nodeSize;
      }

      const cloneRow = tableNode.child(rowIndex);
      // Re-create the same nodes with same attrs, dropping the node content.
      let cells = [];
      cloneRow.forEach(cell => {
        cells.push(
          tableNodes[cell.type.spec.tableRole].createAndFill(
            cell.attrs,
            cell.marks
          )
        );
      });

      return safeInsert(tableNodes.row.create(cloneRow.attrs, cells), rowPos)(
        tr
      );
    }
  }
  return tr;
};

// :: (columnIndex: number) → (tr: Transaction) → Transaction
// Returns a new transaction that removes a column at index `columnIndex`. If there is only one column left, it will remove the entire table.
//
// ```javascript
// dispatch(
//   removeColumnAt(i)(state.tr)
// );
// ```
export const removeColumnAt = columnIndex => tr => {
  const table = findTable(tr.selection);
  if (table) {
    const map = TableMap.get(table.node);
    if (columnIndex === 0 && map.width === 1) {
      return removeTable(tr);
    } else if (columnIndex >= 0 && columnIndex <= map.width) {
      removeColumn(
        tr,
        {
          map,
          tableStart: table.start,
          table: table.node
        },
        columnIndex
      );
      return cloneTr(tr);
    }
  }
  return tr;
};

// :: (rowIndex: number) → (tr: Transaction) → Transaction
// Returns a new transaction that removes a row at index `rowIndex`. If there is only one row left, it will remove the entire table.
//
// ```javascript
// dispatch(
//   removeRowAt(i)(state.tr)
// );
// ```
export const removeRowAt = rowIndex => tr => {
  const table = findTable(tr.selection);
  if (table) {
    const map = TableMap.get(table.node);
    if (rowIndex === 0 && map.height === 1) {
      return removeTable(tr);
    } else if (rowIndex >= 0 && rowIndex <= map.height) {
      removeRow(
        tr,
        {
          map,
          tableStart: table.start,
          table: table.node
        },
        rowIndex
      );
      return cloneTr(tr);
    }
  }
  return tr;
};

// :: (tr: Transaction) → Transaction
// Returns a new transaction that removes a table node if the cursor is inside of it.
//
// ```javascript
// dispatch(
//   removeTable(state.tr)
// );
// ```
export const removeTable = tr => {
  const { $from } = tr.selection;
  for (let depth = $from.depth; depth > 0; depth--) {
    let node = $from.node(depth);
    if (node.type.spec.tableRole === 'table') {
      return cloneTr(tr.delete($from.before(depth), $from.after(depth)));
    }
  }
  return tr;
};

// :: (tr: Transaction) → Transaction
// Returns a new transaction that removes selected columns.
//
// ```javascript
// dispatch(
//   removeSelectedColumns(state.tr)
// );
// ```
export const removeSelectedColumns = tr => {
  const { selection } = tr;
  if (isTableSelected(selection)) {
    return removeTable(tr);
  }
  if (isCellSelection(selection)) {
    const table = findTable(selection);
    if (table) {
      const map = TableMap.get(table.node);
      const rect = map.rectBetween(
        selection.$anchorCell.pos - table.start,
        selection.$headCell.pos - table.start
      );
      for (let i = rect.right - 1; i >= rect.left; i--) {
        tr = removeColumnAt(i)(tr);
      }
      return tr;
    }
  }
  return tr;
};

// :: (tr: Transaction) → Transaction
// Returns a new transaction that removes selected rows.
//
// ```javascript
// dispatch(
//   removeSelectedRows(state.tr)
// );
// ```
export const removeSelectedRows = tr => {
  const { selection } = tr;
  if (isTableSelected(selection)) {
    return removeTable(tr);
  }
  if (isCellSelection(selection)) {
    const table = findTable(selection);
    if (table) {
      const map = TableMap.get(table.node);
      const rect = map.rectBetween(
        selection.$anchorCell.pos - table.start,
        selection.$headCell.pos - table.start
      );
      for (let i = rect.bottom - 1; i >= rect.top; i--) {
        tr = removeRowAt(i)(tr);
      }
      return tr;
    }
  }
  return tr;
};

// :: ($pos: ResolvedPos) → (tr: Transaction) → Transaction
// Returns a new transaction that removes a column closest to a given `$pos`.
//
// ```javascript
// dispatch(
//   removeColumnClosestToPos(state.doc.resolve(3))(state.tr)
// );
// ```
export const removeColumnClosestToPos = $pos => tr => {
  const rect = findCellRectClosestToPos($pos);
  if (rect) {
    return removeColumnAt(rect.left)(setTextSelection($pos.pos)(tr));
  }
  return tr;
};

// :: ($pos: ResolvedPos) → (tr: Transaction) → Transaction
// Returns a new transaction that removes a row closest to a given `$pos`.
//
// ```javascript
// dispatch(
//   removeRowClosestToPos(state.doc.resolve(3))(state.tr)
// );
// ```
export const removeRowClosestToPos = $pos => tr => {
  const rect = findCellRectClosestToPos($pos);
  if (rect) {
    return removeRowAt(rect.top)(setTextSelection($pos.pos)(tr));
  }
  return tr;
};

// :: (columnIndex: number, cellTransform: (cell: {pos: number, start: number, node: ProseMirrorNode}, tr: Transaction) → Transaction, setCursorToLastCell: ?boolean) → (tr: Transaction) → Transaction
// Returns a new transaction that maps a given `cellTransform` function to each cell in a column at a given `columnIndex`.
// It will set the selection into the last cell of the column if `setCursorToLastCell` param is set to `true`.
//
// ```javascript
// dispatch(
//   forEachCellInColumn(0, (cell, tr) => emptyCell(cell, state.schema)(tr))(state.tr)
// );
// ```
export const forEachCellInColumn = (
  columnIndex,
  cellTransform,
  setCursorToLastCell
) => tr => {
  const cells = getCellsInColumn(columnIndex)(tr.selection);
  if (cells) {
    for (let i = cells.length - 1; i >= 0; i--) {
      tr = cellTransform(cells[i], tr);
    }
    if (setCursorToLastCell) {
      const $pos = tr.doc.resolve(tr.mapping.map(cells[cells.length - 1].pos));
      tr.setSelection(Selection.near($pos));
    }
    return cloneTr(tr);
  }
  return tr;
};

// :: (rowIndex: number, cellTransform: (cell: {pos: number, start: number, node: ProseMirrorNode}, tr: Transaction) → Transaction, setCursorToLastCell: ?boolean) → (tr: Transaction) → Transaction
// Returns a new transaction that maps a given `cellTransform` function to each cell in a row at a given `rowIndex`.
// It will set the selection into the last cell of the row if `setCursorToLastCell` param is set to `true`.
//
// ```javascript
// dispatch(
//   forEachCellInRow(0, (cell, tr) => setCellAttrs(cell, { background: 'red' })(tr))(state.tr)
// );
// ```
export const forEachCellInRow = (
  rowIndex,
  cellTransform,
  setCursorToLastCell
) => tr => {
  const cells = getCellsInRow(rowIndex)(tr.selection);
  if (cells) {
    for (let i = cells.length - 1; i >= 0; i--) {
      tr = cellTransform(cells[i], tr);
    }
    if (setCursorToLastCell) {
      const $pos = tr.doc.resolve(tr.mapping.map(cells[cells.length - 1].pos));
      tr.setSelection(Selection.near($pos));
    }
  }
  return tr;
};

// :: (cell: {pos: number, start: number, node: ProseMirrorNode}, attrs: Object) → (tr: Transaction) → Transaction
// Returns a new transaction that sets given `attrs` to a given `cell`.
//
// ```javascript
// dispatch(
//   setCellAttrs(findCellClosestToPos($pos), { background: 'blue' })(tr);
// );
// ```
export const setCellAttrs = (cell, attrs) => tr => {
  if (cell) {
    tr.setNodeMarkup(cell.pos, null, Object.assign({}, cell.node.attrs, attrs));
    return cloneTr(tr);
  }
  return tr;
};

// :: (schema: Schema, rowsCount: ?number, colsCount: ?number, withHeaderRow: ?boolean) → Node
// Returns a table node of a given size.
// `withHeaderRow` defines whether the first row of the table will be a header row.
//
// ```javascript
// const table = createTable(state.schema); // 3x3 table node
// dispatch(
//   tr.replaceSelectionWith(table).scrollIntoView()
// );
// ```
export const createTable = (
  schema,
  rowsCount = 3,
  colsCount = 3,
  withHeaderRow = true
) => {
  const {
    cell: tableCell,
    header_cell: tableHeader,
    row: tableRow,
    table
  } = tableNodeTypes(schema);

  const cells = [];
  for (let i = 0; i < colsCount; i++) {
    cells.push(tableCell.createAndFill(null));
  }

  const headerCells = [];
  if (withHeaderRow) {
    for (let i = 0; i < colsCount; i++) {
      headerCells.push(tableHeader.createAndFill(null));
    }
  }

  const rows = [];
  for (let i = 0; i < rowsCount; i++) {
    rows.push(
      tableRow.createChecked(
        null,
        withHeaderRow && i === 0 ? headerCells : cells
      )
    );
  }

  return table.createChecked(null, rows);
};

// :: ($pos: ResolvedPos) → ?{pos: number, start: number, node: ProseMirrorNode}
// Iterates over parent nodes, returning a table cell or a table header node closest to a given `$pos`.
//
// ```javascript
// const cell = findCellClosestToPos(state.selection.$from);
// ```
export const findCellClosestToPos = $pos => {
  const predicate = node =>
    node.type.spec.tableRole && /cell/i.test(node.type.spec.tableRole);
  return findParentNodeClosestToPos($pos, predicate);
};

// :: ($pos: ResolvedPos) → ?{left: number, top: number, right: number, bottom: number}
// Returns the rectangle spanning a cell closest to a given `$pos`.
//
// ```javascript
// dispatch(
//   findCellRectClosestToPos(state.selection.$from)
// );
// ```
export const findCellRectClosestToPos = $pos => {
  const cell = findCellClosestToPos($pos);
  if (cell) {
    const table = findTableClosestToPos($pos);
    const map = TableMap.get(table.node);
    const cellPos = cell.pos - table.start;
    return map.rectBetween(cellPos, cellPos);
  }
};
