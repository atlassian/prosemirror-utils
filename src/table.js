import { CellSelection, TableMap } from "prosemirror-tables";
import { Slice } from "prosemirror-model";
import { findParentNode } from "./selection";
import { cloneTr, tableNodeTypes } from "./helpers";

// :: (selection: Selection) → ?{pos: number, node: ProseMirrorNode}
// Iterates over parent nodes, returning the first found table node.
export const findTable = selection =>
  findParentNode(
    node => node.type.spec.tableRole && node.type.spec.tableRole === "table"
  )(selection);

// :: (selection: Selection) → boolean
// Checks if current selection is a CellSelection
export const isCellSelection = selection => {
  return selection instanceof CellSelection;
};

// :: (columnIndex: number) → (selection: Selection) → boolean
// Checks if entire column at index `columnIndex` is selected
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
// Checks if entire row at index `rowIndex` is selected
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
export const isTableSelected = selection => {
  if (isCellSelection(selection)) {
    return selection.isColSelection() && selection.isRowSelection();
  }

  return false;
};

// :: (columnIndex: number) → (selection: Selection) → ?[{ pos: number, node: ProseMirrorNode }]
// Returns an array of cells in a column at index `columnIndex`.
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
// Creates a CellSelection on a column at `columnIndex`.
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
// Creates a CellSelection on a row at `rowIndex`.
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
// Creates a CellSelection on the entire table.
export const selectTable = tr => {
  const cells = getCellsInTable(tr.selection);
  if (cells) {
    const $anchor = tr.doc.resolve(cells[0].pos);
    const $head = tr.doc.resolve(cells[cells.length - 1].pos);
    return cloneTr(tr.setSelection(new CellSelection($anchor, $head)));
  }
  return tr;
};

// :: (schema: Schema) → (tr: Transaction) → Transaction
// Clears the content of selected cells.
export const emptySelectedCells = schema => tr => {
  if (isCellSelection(tr.selection)) {
    const emptyCell = tableNodeTypes(schema).cell.createAndFill().content;
    tr.selection.forEachCell((cell, pos) => {
      if (!cell.content.eq(emptyCell)) {
        tr.replaceWith(
          tr.mapping.map(pos + 1),
          tr.mapping.map(pos + cell.nodeSize - 1),
          new Slice(emptyCell, 0, 0)
        );
      }
    });
    if (tr.docChanged) {
      return cloneTr(tr);
    }
  }
  return tr;
};
