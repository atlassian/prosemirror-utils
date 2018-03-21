import {
  createEditor,
  doc,
  p,
  table,
  tr as row,
  td,
  th,
  tdCursor,
  tdEmpty,
  toEqualDocument
} from '../test-helpers';
import {
  findTable,
  isCellSelection,
  isColumnSelected,
  isRowSelected,
  isTableSelected,
  getCellsInColumn,
  getCellsInRow,
  getCellsInTable,
  selectColumn,
  selectRow,
  selectTable,
  emptySelectedCells,
  addColumnAt,
  addRowAt,
  removeColumnAt,
  removeRowAt,
  removeSelectedColumns,
  removeSelectedRows,
  removeTable
} from '../src';

describe('table', () => {
  describe('findTable', () => {
    it('should find table node if cursor is inside of a table cell', () => {
      const { state: { selection } } = createEditor(doc(table(row(tdCursor))));
      const { node } = findTable(selection);
      expect(node.type.name).toEqual('table');
    });
    it('should return `undefined` if there is no table parent node', () => {
      const { state: { selection } } = createEditor(doc(p('<cursor>')));
      const result = findTable(selection);
      expect(result).toBeUndefined();
    });
  });

  describe('isCellSelection', () => {
    it('should return `true` if current selection is a CellSelection', () => {
      const { state: { selection } } = createEditor(
        doc(table(row(td(p('<anchor>')), td(p('<head>')))))
      );
      expect(isCellSelection(selection)).toBe(true);
    });
    it('should return `false` if current selection is not a CellSelection', () => {
      const { state: { selection } } = createEditor(doc(p('<cursor>')));
      expect(isCellSelection(selection)).toBe(false);
    });
  });

  describe('isColumnSelected', () => {
    it('should return `true` if CellSelection spans the entire column', () => {
      const { state: { selection } } = createEditor(
        doc(table(row(td(p('<anchor>'))), row(tdEmpty), row(td(p('<head>')))))
      );
      expect(isColumnSelected(0)(selection)).toBe(true);
    });
    it('should return `false` if CellSelection does not span the entire column', () => {
      const { state: { selection } } = createEditor(
        doc(table(row(td(p('<anchor>'))), row(td(p('<head>'))), row(tdEmpty)))
      );
      expect(isColumnSelected(0)(selection)).toBe(false);
    });
  });

  describe('isRowSelected', () => {
    it('should return `true` if CellSelection spans the entire row', () => {
      const { state: { selection } } = createEditor(
        doc(table(row(td(p('<anchor>')), tdEmpty, td(p('<head>')))))
      );
      expect(isRowSelected(0)(selection)).toBe(true);
    });
    it('should return `false` if CellSelection does not span the entire row', () => {
      const { state: { selection } } = createEditor(
        doc(table(row(td(p('<anchor>')), td(p('<head>')), tdEmpty)))
      );
      expect(isRowSelected(0)(selection)).toBe(false);
    });
  });

  describe('isTableSelected', () => {
    it('should return `true` if CellSelection spans the entire table', () => {
      const { state: { selection } } = createEditor(
        doc(
          table(
            row(td(p('<anchor>')), tdEmpty, tdEmpty),
            row(tdEmpty, tdEmpty, td(p('<head>')))
          )
        )
      );
      expect(isTableSelected(selection)).toBe(true);
    });
    it('should return `false` if CellSelection does not span the entire table', () => {
      const { state: { selection } } = createEditor(
        doc(
          table(
            row(td(p('<anchor>')), tdEmpty, tdEmpty),
            row(td(p('<head>')), tdEmpty, tdEmpty)
          )
        )
      );
      expect(isTableSelected(selection)).toBe(false);
    });
  });

  describe('getCellsInColumn', () => {
    it('should return `undefined` when cursor is outside of a table node', () => {
      const { state: { selection } } = createEditor(doc(p('<cursor>')));
      expect(getCellsInColumn(0)(selection)).toBeUndefined();
    });
    it('should return an array of cells in a column', () => {
      const { state: { selection } } = createEditor(
        doc(
          table(
            row(td(p('1')), tdCursor, tdEmpty),
            row(td(p('2')), tdEmpty, tdEmpty)
          )
        )
      );
      const cells = getCellsInColumn(0)(selection);
      cells.forEach((cell, i) => {
        expect(cell.node.type.name).toEqual('table_cell');
        expect(cell.node.textContent).toEqual(`${i + 1}`);
        expect(typeof cell.pos).toEqual('number');
      });
      expect(cells[0].pos).toEqual(2);
      expect(cells[1].pos).toEqual(17);
    });
  });

  describe('getCellsInRow', () => {
    it('should return `undefined` when cursor is outside of a table node', () => {
      const { state: { selection } } = createEditor(doc(p('<cursor>')));
      expect(getCellsInRow(0)(selection)).toBeUndefined();
    });
    it('should return an array of cells in a row', () => {
      const { state: { selection } } = createEditor(
        doc(
          table(
            row(td(p('1')), td(p('2')), td(p('3'))),
            row(tdCursor, tdEmpty, tdEmpty)
          )
        )
      );
      const cells = getCellsInRow(0)(selection);
      cells.forEach((cell, i) => {
        expect(cell.node.type.name).toEqual('table_cell');
        expect(cell.node.textContent).toEqual(`${i + 1}`);
        expect(typeof cell.pos).toEqual('number');
      });
      expect(cells[0].pos).toEqual(2);
      expect(cells[1].pos).toEqual(7);
      expect(cells[2].pos).toEqual(12);
    });
  });

  describe('getCellsInTable', () => {
    it('should return `undefined` when cursor is outside of a table node', () => {
      const { state: { selection } } = createEditor(doc(p('<cursor>')));
      expect(getCellsInTable(selection)).toBeUndefined();
    });
    it('should return an array of all cells', () => {
      const { state: { selection } } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2')), td(p('3'))),
            row(td(p('4')), td(p('5')), td(p('6')))
          )
        )
      );
      const cells = getCellsInTable(selection);
      cells.forEach((cell, i) => {
        expect(cell.node.type.name).toEqual('table_cell');
        expect(cell.node.textContent).toEqual(`${i + 1}`);
        expect(typeof cell.pos).toEqual('number');
      });
      expect(cells[0].pos).toEqual(2);
      expect(cells[1].pos).toEqual(7);
      expect(cells[2].pos).toEqual(12);
      expect(cells[3].pos).toEqual(19);
      expect(cells[4].pos).toEqual(24);
      expect(cells[5].pos).toEqual(29);
    });
  });

  describe('selectColumn', () => {
    it("should return an original transaction if table doesn't have a column at `columnIndex`", () => {
      const { state: { tr } } = createEditor(
        doc(table(row(td(p('1<cursor>')), td(p('2')))))
      );
      const newTr = selectColumn(2)(tr);
      expect(tr).toBe(newTr);
    });
    it('should return a new transaction that selects a column at `columnIndex`', () => {
      const { state: { tr } } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = selectColumn(0)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.selection.$anchorCell.pos).toEqual(2);
      expect(newTr.selection.$headCell.pos).toEqual(14);
    });
  });

  describe('selectRow', () => {
    it("should return an original transaction if table doesn't have a row at `rowIndex`", () => {
      const { state: { tr } } = createEditor(
        doc(table(row(td(p('1<cursor>'))), row(td(p('2')))))
      );
      const newTr = selectRow(2)(tr);
      expect(tr).toBe(newTr);
    });
    it('should return a new transaction that selects a row at `rowIndex`', () => {
      const { state: { tr } } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = selectRow(0)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.selection.$anchorCell.pos).toEqual(2);
      expect(newTr.selection.$headCell.pos).toEqual(7);
    });
  });

  describe('selectTable', () => {
    it('should return a new transaction that selects the entire table', () => {
      const { state: { tr } } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = selectTable(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.selection.$anchorCell.pos).toEqual(2);
      expect(newTr.selection.$headCell.pos).toEqual(19);
    });
  });

  describe('emptySelectedCells', () => {
    it('should return a new transaction that selects the entire table', () => {
      const { state: { schema, tr } } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = emptySelectedCells(schema)(selectColumn(0)(tr));
      expect(newTr).not.toBe(tr);
      toEqualDocument(
        newTr.doc,
        doc(table(row(td(p('')), td(p('2'))), row(td(p('')), td(p('4')))))
      );
    });
  });

  describe('addColumnAt', () => {
    it("should return an original transaction if table doesn't have a column at `columnIndex`", () => {
      const { state: { tr } } = createEditor(
        doc(table(row(td(p('1<cursor>')), td(p('2')))))
      );
      const newTr = addColumnAt(3)(tr);
      expect(tr).toBe(newTr);
    });
    it('should return a new transaction that adds a new column at index 0', () => {
      const { state: { schema, tr } } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = addColumnAt(0)(tr);
      expect(newTr).not.toBe(tr);
      toEqualDocument(
        newTr.doc,
        doc(
          table(
            row(tdEmpty, td(p('1')), td(p('2'))),
            row(tdEmpty, td(p('3')), td(p('4')))
          )
        )
      );
    });
    it('should return a new transaction that adds a new column in the middle', () => {
      const { state: { schema, tr } } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = addColumnAt(1)(tr);
      expect(newTr).not.toBe(tr);
      toEqualDocument(
        newTr.doc,
        doc(
          table(
            row(td(p('1')), tdEmpty, td(p('2'))),
            row(td(p('3')), tdEmpty, td(p('4')))
          )
        )
      );
    });
    it('should return a new transaction that adds a new column at last index', () => {
      const { state: { schema, tr } } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = addColumnAt(2)(tr);
      expect(newTr).not.toBe(tr);
      toEqualDocument(
        newTr.doc,
        doc(
          table(
            row(td(p('1')), td(p('2')), tdEmpty),
            row(td(p('3')), td(p('4')), tdEmpty)
          )
        )
      );
    });
  });

  describe('addRowAt', () => {
    it("should return an original transaction if table doesn't have a row at `rowIndex`", () => {
      const { state: { tr } } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = addRowAt(3)(tr);
      expect(tr).toBe(newTr);
    });
    it('should return a new transaction that adds a new row at index 0', () => {
      const { state: { schema, tr } } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = addRowAt(0)(tr);
      expect(newTr).not.toBe(tr);
      toEqualDocument(
        newTr.doc,
        doc(
          table(
            row(tdEmpty, tdEmpty),
            row(td(p('1')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
    });
    it('should return a new transaction that adds a new row in the middle', () => {
      const { state: { schema, tr } } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = addRowAt(1)(tr);
      expect(newTr).not.toBe(tr);
      toEqualDocument(
        newTr.doc,
        doc(
          table(
            row(td(p('1')), td(p('2'))),
            row(tdEmpty, tdEmpty),
            row(td(p('3')), td(p('4')))
          )
        )
      );
    });
    it('should return a new transaction that adds a new row at last index', () => {
      const { state: { schema, tr } } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = addRowAt(2)(tr);
      expect(newTr).not.toBe(tr);
      toEqualDocument(
        newTr.doc,
        doc(
          table(
            row(td(p('1')), td(p('2'))),
            row(td(p('3')), td(p('4'))),
            row(tdEmpty, tdEmpty)
          )
        )
      );
    });
  });

  describe('removeColumnAt', () => {
    it("should return an original transaction if table doesn't have a column at `columnIndex`", () => {
      const { state: { tr } } = createEditor(
        doc(table(row(td(p('1<cursor>')), td(p('2')))))
      );
      const newTr = removeColumnAt(3)(tr);
      expect(tr).toBe(newTr);
    });
    it('should return a new transaction that removes a column at index 0', () => {
      const { state: { schema, tr } } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = removeColumnAt(0)(tr);
      expect(newTr).not.toBe(tr);
      toEqualDocument(newTr.doc, doc(table(row(td(p('2'))), row(td(p('4'))))));
    });
    it('should return a new transaction that removes a column in the middle', () => {
      const { state: { schema, tr } } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2')), td(p('3'))),
            row(td(p('4')), td(p('5')), td(p('6')))
          )
        )
      );
      const newTr = removeColumnAt(1)(tr);
      expect(newTr).not.toBe(tr);
      toEqualDocument(
        newTr.doc,
        doc(table(row(td(p('1')), td(p('3'))), row(td(p('4')), td(p('6')))))
      );
    });
    it('should return a new transaction that removes a column at last index', () => {
      const { state: { schema, tr } } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = removeColumnAt(1)(tr);
      expect(newTr).not.toBe(tr);
      toEqualDocument(newTr.doc, doc(table(row(td(p('1'))), row(td(p('3'))))));
    });
  });

  describe('removeRowAt', () => {
    it("should return an original transaction if table doesn't have a row at `rowIndex`", () => {
      const { state: { tr } } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = removeRowAt(3)(tr);
      expect(tr).toBe(newTr);
    });
    it('should return a new transaction that removes a row at index 0', () => {
      const { state: { schema, tr } } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = removeRowAt(0)(tr);
      expect(newTr).not.toBe(tr);
      toEqualDocument(newTr.doc, doc(table(row(td(p('3')), td(p('4'))))));
    });
    it('should return a new transaction that removes a row in the middle', () => {
      const { state: { schema, tr } } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4'))),
            row(td(p('5')), td(p('6')))
          )
        )
      );
      const newTr = removeRowAt(1)(tr);
      expect(newTr).not.toBe(tr);
      toEqualDocument(
        newTr.doc,
        doc(table(row(td(p('1')), td(p('2'))), row(td(p('5')), td(p('6')))))
      );
    });
    it('should return a new transaction that removes a row at last index', () => {
      const { state: { schema, tr } } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = removeRowAt(1)(tr);
      expect(newTr).not.toBe(tr);
      toEqualDocument(newTr.doc, doc(table(row(td(p('1')), td(p('2'))))));
    });
  });

  describe('removeSelectedColumns', () => {
    it('should return an original transaction if selection is not a CellSelection', () => {
      const { state: { tr } } = createEditor(
        doc(table(row(td(p('1<cursor>')), td(p('2')))))
      );
      const newTr = removeSelectedColumns(tr);
      expect(tr).toBe(newTr);
    });
    it('should return a new transaction that removes selected columns', () => {
      const { state: { schema, tr } } = createEditor(
        doc(
          table(
            row(td(p('1<anchor>')), tdEmpty, tdEmpty),
            row(tdEmpty, td(p('2<head>')), tdEmpty)
          )
        )
      );
      const newTr = removeSelectedColumns(tr);
      expect(newTr).not.toBe(tr);
      toEqualDocument(newTr.doc, doc(table(row(tdEmpty), row(tdEmpty))));
    });
    it('should return a new transaction that removes entire table if all columns are selected', () => {
      const { state: { schema, tr } } = createEditor(
        doc(
          table(
            row(td(p('1<anchor>')), tdEmpty, tdEmpty),
            row(tdEmpty, tdEmpty, td(p('2<head>')))
          )
        )
      );
      const newTr = removeSelectedColumns(tr);
      expect(newTr).not.toBe(tr);
      toEqualDocument(newTr.doc, doc(p('')));
    });
  });

  describe('removeSelectedRows', () => {
    it('should return an original transaction if selection is not a CellSelection', () => {
      const { state: { tr } } = createEditor(
        doc(table(row(td(p('1<cursor>')), td(p('2')))))
      );
      const newTr = removeSelectedRows(tr);
      expect(tr).toBe(newTr);
    });
    it('should return a new transaction that removes selected columns', () => {
      const { state: { schema, tr } } = createEditor(
        doc(
          table(
            row(td(p('1<anchor>')), tdEmpty, tdEmpty),
            row(tdEmpty, tdEmpty, td(p('2<head>'))),
            row(tdEmpty, tdEmpty, tdEmpty)
          )
        )
      );
      const newTr = removeSelectedRows(tr);
      expect(newTr).not.toBe(tr);
      toEqualDocument(newTr.doc, doc(table(row(tdEmpty, tdEmpty, tdEmpty))));
    });
    it('should return a new transaction that removes entire table if all columns are selected', () => {
      const { state: { schema, tr } } = createEditor(
        doc(
          table(
            row(td(p('1<anchor>')), tdEmpty, tdEmpty),
            row(tdEmpty, tdEmpty, td(p('2<head>')))
          )
        )
      );
      const newTr = removeSelectedRows(tr);
      expect(newTr).not.toBe(tr);
      toEqualDocument(newTr.doc, doc(p('')));
    });
  });

  describe('removeTable', () => {
    it('should return an original transaction that removes a table if cursor is not inside of it', () => {
      const { state: { tr } } = createEditor(
        doc(p('<cursor>'), table(row(td(p('1')), td(p('2')))))
      );
      const newTr = removeTable(tr);
      expect(tr).toBe(newTr);
    });
    it('should return a new transaction that removes a table if cursor is inside', () => {
      const { state: { schema, tr } } = createEditor(
        doc(table(row(td(p('1<cursor>')), tdEmpty), row(tdEmpty, tdEmpty)))
      );
      const newTr = removeTable(tr);
      expect(newTr).not.toBe(tr);
      toEqualDocument(newTr.doc, doc(p('')));
    });
  });
});
