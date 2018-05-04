import {
  CellSelection,
  TableMap,
  addColumn,
  addRow,
  removeColumn,
  removeRow
} from 'prosemirror-tables';
import { Slice } from 'prosemirror-model';
import { findParentNode } from './selection';
import {
  cloneTr,
  tableNodeTypes,
  findCellRectClosestToPos,
  findCellClosestToPos
} from './helpers';

// :: (selection: Selection) → ?{pos: number, node: ProseMirrorNode}
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

// :: (columnIndex: number) → (selection: Selection) → ?[{ pos: number, node: ProseMirrorNode }]
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
      return cells.map(pos => {
        const node = table.node.nodeAt(pos);
        return { pos: pos + table.pos, node };
      });
    }
  }
};

// :: (rowIndex: number) → (selection: Selection) → ?[{ pos: number, node: ProseMirrorNode }]
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
      return cells.map(pos => {
        const node = table.node.nodeAt(pos);
        return { pos: pos + table.pos, node };
      });
    }
  }
};

// :: (selection: Selection) → ?[{ pos: number, node: ProseMirrorNode }]
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
    return cells.map(pos => {
      const node = table.node.nodeAt(pos);
      return { pos: pos + table.pos, node };
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

// :: ($pos: ResolvedPos, schema: Schema) → (tr: Transaction) → Transaction
// Returns a new transaction that clears the content of a cell closest to a given `$pos`.
//
// ```javascript
// dispatch(
//   emptyCellClosestToPos(state.doc.resolve(10), state.schema)(state.tr)
// );
// ```
export const emptyCellClosestToPos = ($pos, schema) => tr => {
  const cell = findCellClosestToPos($pos);
  if (cell) {
    const emptyCell = tableNodeTypes(schema).cell.createAndFill().content;
    if (!cell.node.content.eq(emptyCell)) {
      tr.replaceWith(
        $pos.pos,
        $pos.pos + cell.node.nodeSize - 1,
        new Slice(emptyCell, 0, 0)
      );
      return cloneTr(tr);
    }
  }
  return tr;
};

// :: (schema: Schema) → (tr: Transaction) → Transaction
// Returns a new transaction that clears the content of selected cells.
//
// ```javascript
// dispatch(
//   emptySelectedCells(state.schema)(state.tr)
// );
// ```
export const emptySelectedCells = schema => tr => {
  if (isCellSelection(tr.selection)) {
    const emptyCell = tableNodeTypes(schema).cell.createAndFill().content;
    tr.selection.forEachCell((cell, pos) => {
      if (!cell.content.eq(emptyCell)) {
        const $pos = tr.doc.resolve(tr.mapping.map(pos + 1));
        tr = emptyCellClosestToPos($pos, schema)(tr);
      }
    });
    if (tr.docChanged) {
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
            tableStart: table.pos,
            table: table.node
          },
          columnIndex
        )
      );
    }
  }
  return tr;
};

// :: (rowIndex: number) → (tr: Transaction) → Transaction
// Returns a new transaction that adds a new row at index `rowIndex`.
//
// ```javascript
// dispatch(
//   addRowAt(i)(state.tr)
// );
// ```
export const addRowAt = rowIndex => tr => {
  const table = findTable(tr.selection);
  if (table) {
    const map = TableMap.get(table.node);
    if (rowIndex >= 0 && rowIndex <= map.height) {
      return cloneTr(
        addRow(
          tr,
          {
            map,
            tableStart: table.pos,
            table: table.node
          },
          rowIndex
        )
      );
    }
  }
  return tr;
};

// :: (columnIndex: number) → (tr: Transaction) → Transaction
// Returns a new transaction that removes a column at index `columnIndex`.
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
    if (columnIndex >= 0 && columnIndex <= map.width) {
      removeColumn(
        tr,
        {
          map,
          tableStart: table.pos,
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
// Returns a new transaction that removes a row at index `rowIndex`.
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
    if (rowIndex >= 0 && rowIndex <= map.height) {
      removeRow(
        tr,
        {
          map,
          tableStart: table.pos,
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
  if (isCellSelection(selection) && selection.isColSelection()) {
    const table = findTable(selection);
    if (table) {
      const map = TableMap.get(table.node);
      const rect = map.rectBetween(
        selection.$anchorCell.pos - table.pos,
        selection.$headCell.pos - table.pos
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
  if (isCellSelection(selection) && selection.isRowSelection()) {
    const table = findTable(selection);
    if (table) {
      const map = TableMap.get(table.node);
      const rect = map.rectBetween(
        selection.$anchorCell.pos - table.pos,
        selection.$headCell.pos - table.pos
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
    return removeColumnAt(rect.left)(tr);
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
    return removeRowAt(rect.top)(tr);
  }
  return tr;
};
