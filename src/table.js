import { CellSelection, TableMap } from 'prosemirror-tables';
import { findParentNode } from './ancestors';

// :: (selection: Selection) → ?{pos: number, node: ProseMirrorNode}
// Iterates over parent nodes, returning the first found table node.
export const findTable = (selection) => findParentNode(node => node.type.spec.tableRole && node.type.spec.tableRole === 'table')(selection);

// :: (selection: Selection) → boolean
// Checks if current selection is a CellSelection
export const isCellSelection = (selection) => {
  return selection instanceof CellSelection
};

// :: (columnIndex: number) → (selection: Selection) → boolean
// Checks if entire column at index `columnIndex` is selected
export const isColumnSelected = (columnIndex) => (selection) => {
  if (isCellSelection(selection)) {
    const { $anchorCell, $headCell } = selection;
    const start = $anchorCell.start(-1);
    const map = TableMap.get($anchorCell.node(-1));
    const anchor = map.colCount($anchorCell.pos - start);
    const head = map.colCount($headCell.pos - start);

    return (
      selection.isColSelection() &&
      (
        columnIndex <= Math.max(anchor, head) &&
        columnIndex >= Math.min(anchor, head)
      )
    );
  }

  return false;
};

// :: (rowIndex: number) → (selection: Selection) → boolean
// Checks if entire row at index `rowIndex` is selected
export const isRowSelected = (rowIndex) => (selection) => {
  if (isCellSelection(selection)) {
    const { $anchorCell, $headCell } = selection;
    const anchor = $anchorCell.index(-1);
    const head = $headCell.index(-1);

    return (
      selection.isRowSelection() &&
      (
        rowIndex <= Math.max(anchor, head) &&
        rowIndex >= Math.min(anchor, head)
      )
    );
  }

  return false;
};

// :: (selection: Selection) → boolean
// Checks if entire table is selected
export const isTableSelected = (selection) => {
  if (isCellSelection(selection)) {
    return selection.isColSelection() && selection.isRowSelection();
  }

  return false;
};

// :: (columnIndex: number) → (selection: Selection) → [{ pos: number, node: ProseMirrorNode }]
// Returns an array of cells in a column at index `columnIndex`.
export const getCellsInColumn = (columnIndex) => (selection) => {
  const table = findTable(selection);
  if (table) {
    const map = TableMap.get(table.node);
    const cells = map.cellsInRect({ left: columnIndex, right: columnIndex + 1, top: 0, bottom: map.height });
    return cells.map(pos => {
      const node = table.node.nodeAt(pos);
      return { pos: pos + table.pos, node };
    });
  }
};

// :: (rowIndex: number) → (selection: Selection) → [{ pos: number, node: ProseMirrorNode }]
// Returns an array of cells in a row at index `rowIndex`.
export const getCellsInRow = (rowIndex) => (selection) => {
  const table = findTable(selection);
  if (table) {
    const map = TableMap.get(table.node);
    const cells = map.cellsInRect({ left: 0, right: map.width, top: rowIndex, bottom: rowIndex + 1 });
    return cells.map(pos => {
      const node = table.node.nodeAt(pos);
      return { pos: pos + table.pos, node };
    });
  }
};

// :: (selection: Selection) → [{ pos: number, node: ProseMirrorNode }]
// Returns an array of all cells in a table.
export const getCellsInTable = (selection) => {
  const table = findTable(selection);
  if (table) {
    const map = TableMap.get(table.node);
    const cells = map.cellsInRect({ left: 0, right: map.width, top: 0, bottom: map.height });
    return cells.map(pos => {
      const node = table.node.nodeAt(pos);
      return { pos: pos + table.pos, node };
    });
  }
};
