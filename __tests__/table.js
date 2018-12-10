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
  thEmpty,
  thWithNonWidthChar,
  tdWithNonWidthChar,
  createEmptyParagraph
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
  emptyCell,
  addColumnAt,
  addRowAt,
  removeColumnAt,
  removeRowAt,
  removeSelectedColumns,
  removeSelectedRows,
  removeTable,
  removeColumnClosestToPos,
  removeRowClosestToPos,
  forEachCellInColumn,
  forEachCellInRow,
  findCellClosestToPos,
  findCellRectClosestToPos,
  setCellAttrs,
  createTable,
  cloneRowAt,
  getSelectionRect,
  getSelectionRangeInColumn,
  getSelectionRangeInRow
} from '../src';

describe('table', () => {
  describe('findTable', () => {
    it('should find table node if cursor is inside of a table cell', () => {
      const {
        state: { selection }
      } = createEditor(doc(table(row(tdCursor))));
      const { node } = findTable(selection);
      expect(node.type.name).toEqual('table');
    });
    it('should return `undefined` if there is no table parent node', () => {
      const {
        state: { selection }
      } = createEditor(doc(p('<cursor>')));
      const result = findTable(selection);
      expect(result).toBeUndefined();
    });
  });

  describe('isCellSelection', () => {
    it('should return `true` if current selection is a CellSelection', () => {
      const {
        state: { selection }
      } = createEditor(doc(table(row(td(p('<anchor>')), td(p('<head>'))))));
      expect(isCellSelection(selection)).toBe(true);
    });
    it('should return `false` if current selection is not a CellSelection', () => {
      const {
        state: { selection }
      } = createEditor(doc(p('<cursor>')));
      expect(isCellSelection(selection)).toBe(false);
    });
  });

  describe('isColumnSelected', () => {
    it('should return `true` if CellSelection spans the entire column', () => {
      const {
        state: { selection }
      } = createEditor(
        doc(table(row(td(p('<anchor>'))), row(tdEmpty), row(td(p('<head>')))))
      );
      expect(isColumnSelected(0)(selection)).toBe(true);
    });
    it('should return `false` if CellSelection does not span the entire column', () => {
      const {
        state: { selection }
      } = createEditor(
        doc(table(row(td(p('<anchor>'))), row(td(p('<head>'))), row(tdEmpty)))
      );
      expect(isColumnSelected(0)(selection)).toBe(false);
    });
    describe('when head column is merged', () => {
      it('should return `true` if CellSelection spans the entire column', () => {
        const {
          state: { selection }
        } = createEditor(
          doc(
            table(
              row(td({ colspan: 2 }, p('<head>')), tdEmpty),
              row(td(p('<anchor>')), tdEmpty, tdEmpty)
            )
          )
        );
        expect(isColumnSelected(0)(selection)).toBe(true);
        expect(isColumnSelected(1)(selection)).toBe(true);
        expect(isColumnSelected(2)(selection)).toBe(false);
      });
    });
    describe('when head column is merged and selection is inverted', () => {
      it('should return `true` if CellSelection spans the entire column', () => {
        const {
          state: { selection }
        } = createEditor(
          doc(
            table(
              row(td(p('<head>')), tdEmpty, tdEmpty),
              row(td({ colspan: 2 }, p('<anchor>')), tdEmpty)
            )
          )
        );
        expect(isColumnSelected(0)(selection)).toBe(true);
        expect(isColumnSelected(1)(selection)).toBe(true);
        expect(isColumnSelected(2)(selection)).toBe(false);
      });
    });
  });

  describe('isRowSelected', () => {
    it('should return `true` if CellSelection spans the entire row', () => {
      const {
        state: { selection }
      } = createEditor(
        doc(table(row(td(p('<anchor>')), tdEmpty, td(p('<head>')))))
      );
      expect(isRowSelected(0)(selection)).toBe(true);
    });
    it('should return `false` if CellSelection does not span the entire row', () => {
      const {
        state: { selection }
      } = createEditor(
        doc(table(row(td(p('<anchor>')), td(p('<head>')), tdEmpty)))
      );
      expect(isRowSelected(0)(selection)).toBe(false);
    });
    describe('when head row is merged', () => {
      it('should return `true` if CellSelection spans the entire row', () => {
        const {
          state: { selection }
        } = createEditor(
          doc(
            table(
              row(td({ rowspan: 2 }, p('<head>')), td(p('<anchor>'))),
              row(tdEmpty),
              row(tdEmpty)
            )
          )
        );
        expect(isRowSelected(0)(selection)).toBe(true);
        expect(isRowSelected(1)(selection)).toBe(true);
        expect(isRowSelected(2)(selection)).toBe(false);
      });
    });
    describe('when head row is merged and selection is inverted', () => {
      it('should return `true` if CellSelection spans the entire row', () => {
        const {
          state: { selection }
        } = createEditor(
          doc(
            table(
              row(td(p('<head>')), td({ rowspan: 2 }, p('<anchor>'))),
              row(tdEmpty),
              row(tdEmpty)
            )
          )
        );
        expect(isRowSelected(0)(selection)).toBe(true);
        expect(isRowSelected(1)(selection)).toBe(true);
        expect(isRowSelected(2)(selection)).toBe(false);
      });
    });
  });

  describe('isTableSelected', () => {
    it('should return `true` if CellSelection spans the entire table', () => {
      const {
        state: { selection }
      } = createEditor(
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
      const {
        state: { selection }
      } = createEditor(
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
      const {
        state: { selection }
      } = createEditor(doc(p('<cursor>')));
      expect(getCellsInColumn(0)(selection)).toBeUndefined();
    });
    it('should return an array of cells in a column', () => {
      const {
        state: { selection }
      } = createEditor(
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
    it('should return an array of cells in a range of columns', () => {
      const {
        state: { selection }
      } = createEditor(
        doc(
          table(
            row(td(p('1')), td(p('3')), tdEmpty),
            row(td(p('2')), td(p('4')), tdEmpty)
          )
        )
      );
      const cells = getCellsInColumn([0, 1])(selection);
      cells.forEach((cell, i) => {
        expect(cell.node.type.name).toEqual('table_cell');
        expect(cell.node.textContent).toEqual(`${i + 1}`);
        expect(typeof cell.pos).toEqual('number');
      });
      expect(cells[0].pos).toEqual(2);
      expect(cells[1].pos).toEqual(18);
      expect(cells[2].pos).toEqual(7);
      expect(cells[3].pos).toEqual(23);
    });
  });

  describe('getCellsInRow', () => {
    it('should return `undefined` when cursor is outside of a table node', () => {
      const {
        state: { selection }
      } = createEditor(doc(p('<cursor>')));
      expect(getCellsInRow(0)(selection)).toBeUndefined();
    });
    it('should return an array of cells in a row', () => {
      const {
        state: { selection }
      } = createEditor(
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
    it('should return an array of cells in a range of rows', () => {
      const {
        state: { selection }
      } = createEditor(
        doc(
          table(
            row(td(p('1')), td(p('2')), td(p('3'))),
            row(td(p('4')), td(p('5')), td(p('6'))),
            row(tdEmpty, tdEmpty, tdEmpty)
          )
        )
      );
      const cells = getCellsInRow([0, 1])(selection);
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

  describe('getCellsInTable', () => {
    it('should return `undefined` when cursor is outside of a table node', () => {
      const {
        state: { selection }
      } = createEditor(doc(p('<cursor>')));
      expect(getCellsInTable(selection)).toBeUndefined();
    });
    it('should return an array of all cells', () => {
      const {
        state: { selection }
      } = createEditor(
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
      const {
        state: { tr }
      } = createEditor(doc(table(row(td(p('1<cursor>')), td(p('2'))))));
      const newTr = selectColumn(2)(tr);
      expect(tr).toBe(newTr);
    });
    it('should return a new transaction that selects a column at `columnIndex`', () => {
      const {
        state: { tr }
      } = createEditor(
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
      const {
        state: { tr }
      } = createEditor(doc(table(row(td(p('1<cursor>'))), row(td(p('2'))))));
      const newTr = selectRow(2)(tr);
      expect(tr).toBe(newTr);
    });
    it('should return a new transaction that selects a row at `rowIndex`', () => {
      const {
        state: { tr }
      } = createEditor(
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
      const {
        state: { tr }
      } = createEditor(
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

  describe('emptyCell', () => {
    it('should return an original transaction if a given cell is undefined', () => {
      const {
        state: { schema, tr }
      } = createEditor(doc(p('one one')));
      const $pos = tr.doc.resolve(2);
      const newTr = emptyCell(findCellClosestToPos($pos), schema)(tr);
      expect(tr).toBe(newTr);
    });
    it('should return a new transaction that empties the content of a given cell', () => {
      const {
        state: { schema, tr }
      } = createEditor(
        doc(
          table(row(td(p('one one')), tdEmpty), row(td(p('two two')), tdEmpty))
        )
      );
      const newTr = forEachCellInColumn(0, (cell, tr) =>
        emptyCell(cell, schema)(tr)
      )(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(
        doc(table(row(tdEmpty, tdEmpty), row(tdEmpty, tdEmpty)))
      );
      expect(newTr.selection.$from.pos).toEqual(8);
    });
  });

  describe('addColumnAt', () => {
    it("should return an original transaction if table doesn't have a column at `columnIndex`", () => {
      const {
        state: { tr }
      } = createEditor(doc(table(row(td(p('1<cursor>')), td(p('2'))))));
      const newTr = addColumnAt(3)(tr);
      expect(tr).toBe(newTr);
    });
    it('should return a new transaction that adds a new column at index 0', () => {
      const {
        state: { schema, tr }
      } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = addColumnAt(0)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(tdEmpty, td(p('1')), td(p('2'))),
            row(tdEmpty, td(p('3')), td(p('4')))
          )
        )
      );
    });
    it('should return a new transaction that adds a new column in the middle', () => {
      const {
        state: { schema, tr }
      } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = addColumnAt(1)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(td(p('1')), tdEmpty, td(p('2'))),
            row(td(p('3')), tdEmpty, td(p('4')))
          )
        )
      );
    });
    it('should return a new transaction that adds a new column at last index', () => {
      const {
        state: { schema, tr }
      } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = addColumnAt(2)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(
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
      const {
        state: { tr }
      } = createEditor(
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
      const {
        state: { schema, tr }
      } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = addRowAt(0)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(
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
      const {
        state: { schema, tr }
      } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = addRowAt(1)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(
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
      const {
        state: { schema, tr }
      } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = addRowAt(2)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(td(p('1')), td(p('2'))),
            row(td(p('3')), td(p('4'))),
            row(tdEmpty, tdEmpty)
          )
        )
      );
    });

    it('should return a new transaction that clones the previous row at the last index', () => {
      const {
        state: { tr }
      } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td({ colspan: 2 }, p('3')))
          )
        )
      );
      const newTr = addRowAt(2, true)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(td(p('1')), td(p('2'))),
            row(td({ colspan: 2 }, p('3'))),
            row(td({ colspan: 2 }, p()))
          )
        )
      );
    });

    it('should return a new transaction that adds a new row at index 0 but shouldnt clone any rows', () => {
      const {
        state: { tr }
      } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = addRowAt(0, true)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(tdEmpty, tdEmpty),
            row(td(p('1')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
    });
  });

  describe('cloneRowAt', () => {
    it('should return a new transaction that clones the previous row at the given index', () => {
      const {
        state: { tr }
      } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(th({ colspan: 2, pretty: true }, p('3')))
          )
        )
      );
      const newTr = cloneRowAt(1)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(td(p('1')), td(p('2'))),
            row(th({ colspan: 2, pretty: true }, p('3'))),
            row(th({ colspan: 2, pretty: true }, p()))
          )
        )
      );
    });

    it('should increment a rowspan if cloning a row in that span', () => {
      const {
        state: { tr }
      } = createEditor(
        doc(
          table(
            row(td({ colspan: 2 }, p('1<cursor>')), td({ rowspan: 3 }, p('2'))),
            row(td(p('3')), td(p(''))),
            row(td(p('4')), td(p('')))
          )
        )
      );

      const newTr = cloneRowAt(0)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(td({ colspan: 2 }, p('1')), td({ rowspan: 4 }, p('2'))),
            row(td({ colspan: 2 }, p())),
            row(td(p('3')), td(p(''))),
            row(td(p('4')), td(p('')))
          )
        )
      );
    });

    it('should increment all rowspans that cover the row', () => {
      const {
        state: { tr }
      } = createEditor(
        doc(
          table(
            row(td(p('0')), td(p()), td(p())),
            row(td(p('1<cursor>')), td(p()), td({ rowspan: 3 }, p('2'))),
            row(td(p('3')), td(p())),
            row(td(p('4')), td({ rowspan: 2 }, p())),
            row(td(p('5')), td(p())),
            row(td(p('6')), td(p()), td(p()))
          )
        )
      );

      const newTr = cloneRowAt(3)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(td(p('0')), td(p()), td(p())),
            row(td(p('1')), td(p()), td({ rowspan: 4 }, p('2'))),
            row(td(p('3')), td(p())),
            row(td(p('4')), td({ rowspan: 3 }, p())),
            row(td(p())),
            row(td(p('5')), td(p())),
            row(td(p('6')), td(p()), td(p()))
          )
        )
      );
    });
  });

  describe('removeColumnAt', () => {
    it("should return an original transaction if table doesn't have a column at `columnIndex`", () => {
      const {
        state: { tr }
      } = createEditor(doc(table(row(td(p('1<cursor>')), td(p('2'))))));
      const newTr = removeColumnAt(3)(tr);
      expect(tr).toBe(newTr);
    });
    it('should return a new transaction that removes a column at index 0', () => {
      const {
        state: { schema, tr }
      } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = removeColumnAt(0)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(
        doc(table(row(td(p('2'))), row(td(p('4')))))
      );
    });
    it('should return a new transaction that removes a column in the middle', () => {
      const {
        state: { schema, tr }
      } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2')), td(p('3'))),
            row(td(p('4')), td(p('5')), td(p('6')))
          )
        )
      );
      const newTr = removeColumnAt(1)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(
        doc(table(row(td(p('1')), td(p('3'))), row(td(p('4')), td(p('6')))))
      );
    });
    it('should return a new transaction that removes a column at last index', () => {
      const {
        state: { schema, tr }
      } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = removeColumnAt(1)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(
        doc(table(row(td(p('1'))), row(td(p('3')))))
      );
    });
    it('should remove the whole table if there is only one column', () => {
      const {
        state: { schema, tr }
      } = createEditor(
        doc(p('1'), table(row(td(p('text<cursor>'))), row(tdEmpty)), p('2'))
      );
      const newTr = removeColumnAt(0)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(doc(p('1'), p('2')));
    });
  });

  describe('removeColumnClosestToPos', () => {
    it('should return an original transaction if a given `$pos` is not inside of a table node', () => {
      const { state } = createEditor(doc(p('1')));
      const { tr } = state;
      const newTr = removeColumnClosestToPos(state.doc.resolve(1))(tr);
      expect(tr).toBe(newTr);
    });
    describe('first col', () => {
      it('should remove a column closest to a given `$pos`', () => {
        const { state } = createEditor(
          doc(
            p('text'),
            table(
              row(td(p('1')), td(p('2')), td(p('3'))),
              row(td(p('4')), td(p('5')), td(p('6')))
            )
          )
        );
        const { tr } = state;
        const newTr = removeColumnClosestToPos(state.doc.resolve(10))(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(
          doc(
            p('text'),
            table(row(td(p('2')), td(p('3'))), row(td(p('5')), td(p('6'))))
          )
        );
      });
    });
    describe('middle col', () => {
      it('should remove a column closest to a given `$pos`', () => {
        const { state } = createEditor(
          doc(
            p('text'),
            table(
              row(td(p('1')), td(p('2')), td(p('3'))),
              row(td(p('4')), td(p('5')), td(p('6')))
            )
          )
        );
        const { tr } = state;
        const newTr = removeColumnClosestToPos(state.doc.resolve(15))(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(
          doc(
            p('text'),
            table(row(td(p('1')), td(p('3'))), row(td(p('4')), td(p('6'))))
          )
        );
      });
    });
    describe('last col', () => {
      it('should remove a column closest to a given `$pos`', () => {
        const { state } = createEditor(
          doc(
            p('text'),
            table(
              row(td(p('1')), td(p('2')), td(p('3'))),
              row(td(p('4')), td(p('5')), td(p('6')))
            )
          )
        );
        const { tr } = state;
        const newTr = removeColumnClosestToPos(state.doc.resolve(20))(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(
          doc(
            p('text'),
            table(row(td(p('1')), td(p('2'))), row(td(p('4')), td(p('5'))))
          )
        );
      });
    });
  });

  describe('removeRowClosestToPos', () => {
    it('should return an original transaction if a given `$pos` is not inside of a table node', () => {
      const { state } = createEditor(doc(p('1')));
      const { tr } = state;
      const newTr = removeRowClosestToPos(state.doc.resolve(1))(tr);
      expect(tr).toBe(newTr);
    });
    describe('first row', () => {
      it('should remove a row closest to a given `$pos`', () => {
        const { state } = createEditor(
          doc(
            p('text'),
            table(
              row(td(p('1')), td(p('2'))),
              row(td(p('3')), td(p('4'))),
              row(td(p('5')), td(p('6')))
            )
          )
        );
        const { tr } = state;
        const newTr = removeRowClosestToPos(state.doc.resolve(10))(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(
          doc(
            p('text'),
            table(row(td(p('3')), td(p('4'))), row(td(p('5')), td(p('6'))))
          )
        );
      });
    });
    describe('middle row', () => {
      it('should remove a row closest to a given `$pos`', () => {
        const { state } = createEditor(
          doc(
            p('text'),
            table(
              row(td(p('1')), td(p('2'))),
              row(td(p('3')), td(p('4<cursor>'))),
              row(td(p('5')), td(p('6')))
            )
          )
        );
        const { tr } = state;
        const newTr = removeRowClosestToPos(state.doc.resolve(22))(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(
          doc(
            p('text'),
            table(row(td(p('1')), td(p('2'))), row(td(p('5')), td(p('6'))))
          )
        );
      });
    });
    describe('last row', () => {
      it('should remove a row closest to a given `$pos`', () => {
        const { state } = createEditor(
          doc(
            p('text'),
            table(
              row(td(p('1')), td(p('2'))),
              row(td(p('3')), td(p('4'))),
              row(td(p('5<cursor>')), td(p('6')))
            )
          )
        );
        const { tr } = state;
        const newTr = removeRowClosestToPos(state.doc.resolve(34))(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(
          doc(
            p('text'),
            table(row(td(p('1')), td(p('2'))), row(td(p('3')), td(p('4'))))
          )
        );
      });
    });
  });

  describe('removeRowAt', () => {
    it("should return an original transaction if table doesn't have a row at `rowIndex`", () => {
      const {
        state: { tr }
      } = createEditor(
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
      const {
        state: { schema, tr }
      } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = removeRowAt(0)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(
        doc(table(row(td(p('3')), td(p('4')))))
      );
    });
    it('should return a new transaction that removes a row in the middle', () => {
      const {
        state: { schema, tr }
      } = createEditor(
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
      expect(newTr.doc).toEqualDocument(
        doc(table(row(td(p('1')), td(p('2'))), row(td(p('5')), td(p('6')))))
      );
    });
    it('should return a new transaction that removes a row at last index', () => {
      const {
        state: { schema, tr }
      } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td(p('3')), td(p('4')))
          )
        )
      );
      const newTr = removeRowAt(1)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(
        doc(table(row(td(p('1')), td(p('2')))))
      );
    });
    it('should remove the whole table if there is only one row', () => {
      const {
        state: { schema, tr }
      } = createEditor(
        doc(p('1'), table(row(td(p('text<cursor>')), tdEmpty)), p('2'))
      );
      const newTr = removeRowAt(0)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(doc(p('1'), p('2')));
    });
  });

  describe('removeSelectedColumns', () => {
    it('should return an original transaction if selection is not a CellSelection', () => {
      const {
        state: { tr }
      } = createEditor(doc(table(row(td(p('1<cursor>')), td(p('2'))))));
      const newTr = removeSelectedColumns(tr);
      expect(tr).toBe(newTr);
    });
    describe('when the whole column is selected from top to bottom row', () => {
      it('should remove selected columns', () => {
        const {
          state: { schema, tr }
        } = createEditor(
          doc(
            table(
              row(td(p('1<anchor>')), tdEmpty, tdEmpty),
              row(tdEmpty, td(p('2<head>')), tdEmpty)
            )
          )
        );
        const newTr = removeSelectedColumns(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(
          doc(table(row(tdEmpty), row(tdEmpty)))
        );
      });
    });
    describe('when not the whole column is selected', () => {
      it('should remove selected columns', () => {
        const {
          state: { schema, tr }
        } = createEditor(
          doc(
            table(
              row(tdEmpty, tdEmpty, tdEmpty),
              row(td(p('1<anchor>')), tdEmpty, tdEmpty),
              row(tdEmpty, td(p('2<head>')), tdEmpty)
            )
          )
        );
        const newTr = removeSelectedColumns(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(
          doc(table(row(tdEmpty), row(tdEmpty), row(tdEmpty)))
        );
      });
    });
    it('should remove entire table if all columns are selected', () => {
      const {
        state: { schema, tr }
      } = createEditor(
        doc(
          table(
            row(td(p('1<anchor>')), tdEmpty, tdEmpty),
            row(tdEmpty, tdEmpty, td(p('2<head>')))
          )
        )
      );
      const newTr = removeSelectedColumns(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(doc(p('')));
    });
  });

  describe('removeSelectedRows', () => {
    it('should return an original transaction if selection is not a CellSelection', () => {
      const {
        state: { tr }
      } = createEditor(doc(table(row(td(p('1<cursor>')), td(p('2'))))));
      const newTr = removeSelectedRows(tr);
      expect(tr).toBe(newTr);
    });
    describe('when the whole row is selected from left to right', () => {
      it('should remove selected rows', () => {
        const {
          state: { schema, tr }
        } = createEditor(
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
        expect(newTr.doc).toEqualDocument(
          doc(table(row(tdEmpty, tdEmpty, tdEmpty)))
        );
      });
    });
    describe('when not the whole row is selected', () => {
      it('should remove selected rows', () => {
        const {
          state: { schema, tr }
        } = createEditor(
          doc(
            table(
              row(td(p('1<anchor>')), tdEmpty, tdEmpty),
              row(tdEmpty, td(p('2<head>')), tdEmpty),
              row(tdEmpty, tdEmpty, tdEmpty)
            )
          )
        );
        const newTr = removeSelectedRows(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(
          doc(table(row(tdEmpty, tdEmpty, tdEmpty)))
        );
      });
    });
    it('should remove entire table if all rows are selected', () => {
      const {
        state: { schema, tr }
      } = createEditor(
        doc(
          table(
            row(td(p('1<anchor>')), tdEmpty, tdEmpty),
            row(tdEmpty, tdEmpty, td(p('2<head>')))
          )
        )
      );
      const newTr = removeSelectedRows(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(doc(p('')));
    });
  });

  describe('removeTable', () => {
    it('should return an original transaction that removes a table if cursor is not inside of it', () => {
      const {
        state: { tr }
      } = createEditor(doc(p('<cursor>'), table(row(td(p('1')), td(p('2'))))));
      const newTr = removeTable(tr);
      expect(tr).toBe(newTr);
    });
    it('should return a new transaction that removes a table if cursor is inside', () => {
      const {
        state: { schema, tr }
      } = createEditor(
        doc(table(row(td(p('1<cursor>')), tdEmpty), row(tdEmpty, tdEmpty)))
      );
      const newTr = removeTable(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(doc(p('')));
    });
  });

  describe('forEachCellInColumn', () => {
    describe('cells with colspan = 1, rowspan = 1', () => {
      it('should map `emptyCell` to each cell in a column at a given `columnIndex`', () => {
        const {
          state: { schema, tr }
        } = createEditor(
          doc(
            table(
              row(td(p('one one')), tdEmpty),
              row(td(p('two two')), tdEmpty)
            )
          )
        );
        const newTr = forEachCellInColumn(
          0,
          (cell, tr) => emptyCell(cell, schema)(tr),
          true
        )(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(
          doc(table(row(tdEmpty, tdEmpty), row(tdEmpty, tdEmpty)))
        );
        expect(newTr.selection.$from.pos).toEqual(14);
      });
      it('should map `setCellAttrs` to each cell in a column at a given `columnIndex`', () => {
        const {
          state: { schema, tr }
        } = createEditor(
          doc(
            table(
              row(td(p('one one')), tdEmpty),
              row(td(p('two two')), tdEmpty)
            )
          )
        );
        const newTr = forEachCellInColumn(
          0,
          (cell, tr) => setCellAttrs(cell, { ugly: true })(tr),
          true
        )(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(
          doc(
            table(
              row(td({ ugly: true }, p('one one')), tdEmpty),
              row(td({ ugly: true }, p('two two')), tdEmpty)
            )
          )
        );
      });
    });

    describe('merged cells with colspan = 2, rowspan = 1', () => {
      it('should map `emptyCell` to each cell in a column at a given `columnIndex`', () => {
        const {
          state: { schema, tr }
        } = createEditor(
          doc(
            table(
              row(td({ colspan: 2 }, p('one one'))),
              row(td(p('two two')), tdEmpty)
            )
          )
        );
        const newTr = forEachCellInColumn(
          0,
          (cell, tr) => emptyCell(cell, schema)(tr),
          true
        )(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(
          doc(table(row(td({ colspan: 2 }, p(''))), row(tdEmpty, tdEmpty)))
        );
        expect(newTr.selection.$from.pos).toEqual(10);
      });
    });
    describe('merged cells with colspan = 1, rowspan = 2', () => {
      it('should map `emptyCell` to each cell in a column at a given `columnIndex`', () => {
        const {
          state: { schema, tr }
        } = createEditor(
          doc(
            table(
              row(td({ rowspan: 2 }, p('one one')), td(p('two two'))),
              row(tdEmpty)
            )
          )
        );
        const newTr = forEachCellInColumn(
          0,
          (cell, tr) => emptyCell(cell, schema)(tr),
          true
        )(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(
          doc(
            table(
              row(td({ rowspan: 2 }, p('')), td(p('two two'))),
              row(tdEmpty)
            )
          )
        );
        expect(newTr.selection.$from.pos).toEqual(4);
      });
    });
  });

  describe('forEachCellInRow', () => {
    describe('cells with colspan = 1, rowspan = 1', () => {
      it('should map `emptyCell` to each cell in a row at a given `rowIndex`', () => {
        const {
          state: { schema, tr }
        } = createEditor(
          doc(
            table(
              row(td(p('one one')), td(p('two two'))),
              row(tdEmpty, tdEmpty)
            )
          )
        );
        const newTr = forEachCellInRow(
          0,
          (cell, tr) => emptyCell(cell, schema)(tr),
          true
        )(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(
          doc(table(row(tdEmpty, tdEmpty), row(tdEmpty, tdEmpty)))
        );
        expect(newTr.selection.$from.pos).toEqual(8);
      });
      it('should map `setCellAttrs` to each cell in a row at a given `rowIndex`', () => {
        const {
          state: { schema, tr }
        } = createEditor(
          doc(table(row(tdEmpty, tdEmpty), row(tdEmpty, tdEmpty)))
        );
        const newTr = forEachCellInRow(
          0,
          (cell, tr) => setCellAttrs(cell, { ugly: true })(tr),
          true
        )(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(
          doc(
            table(
              row(td({ ugly: true }, p('')), td({ ugly: true }, p(''))),
              row(tdEmpty, tdEmpty)
            )
          )
        );
      });
    });

    describe('merged cells with colspan = 2, rowspan = 1', () => {
      it('should map `emptyCell` to each cell in a row at a given `rowIndex`', () => {
        const {
          state: { schema, tr }
        } = createEditor(
          doc(
            table(
              row(td({ colspan: 2 }, p('one one')), td(p('two two'))),
              row(tdEmpty, tdEmpty, tdEmpty)
            )
          )
        );
        const newTr = forEachCellInRow(
          0,
          (cell, tr) => emptyCell(cell, schema)(tr),
          true
        )(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(
          doc(
            table(
              row(td({ colspan: 2 }, p('')), tdEmpty),
              row(tdEmpty, tdEmpty, tdEmpty)
            )
          )
        );
        expect(newTr.selection.$from.pos).toEqual(8);
      });
    });
    describe('merged cells with colspan = 1, rowspan = 2', () => {
      it('should map `emptyCell` to each cell in a row at a given `rowIndex`', () => {
        const {
          state: { schema, tr }
        } = createEditor(
          doc(
            table(
              row(td({ rowspan: 2 }, p('one one')), td(p('two two'))),
              row(tdEmpty)
            )
          )
        );
        const newTr = forEachCellInRow(
          0,
          (cell, tr) => emptyCell(cell, schema)(tr),
          true
        )(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(
          doc(table(row(td({ rowspan: 2 }, p('')), tdEmpty), row(tdEmpty)))
        );
        expect(newTr.selection.$from.pos).toEqual(8);
      });
    });
  });

  describe('setCellAttrs', () => {
    it('should return an original transaction if a given cell is undefined', () => {
      const {
        state: { tr }
      } = createEditor(doc(p('one one')));
      const $pos = tr.doc.resolve(2);
      const newTr = setCellAttrs(findCellClosestToPos($pos), { ugly: true })(
        tr
      );
      expect(tr).toBe(newTr);
    });
    it('should return a new transaction that sets given `attrs` to a given cell', () => {
      const {
        state: { tr }
      } = createEditor(doc(table(row(td(p('one')), tdEmpty))));
      const $pos = tr.doc.resolve(5);
      const newTr = setCellAttrs(findCellClosestToPos($pos), { ugly: true })(
        tr
      );
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(
        doc(table(row(td({ ugly: true }, p('one')), tdEmpty)))
      );
    });
  });

  describe('createTable', () => {
    it('should create a table node of size 3x3 by default', () => {
      const {
        state: { schema }
      } = createEditor(doc(p('')));
      const table = createTable(schema);
      expect(table.content.childCount).toEqual(3);
      expect(table.content.child(0).childCount).toEqual(3);
      expect(table.content.child(0).child(0).type).toEqual(
        schema.nodes.table_header
      );
    });

    describe('when rowsCount = 4 and colsCount = 5', () => {
      it('should create a table node of size 4x5', () => {
        const {
          state: { schema }
        } = createEditor(doc(p('')));
        const table = createTable(schema, 4, 5);
        expect(table.content.childCount).toEqual(4);
        expect(table.content.child(0).childCount).toEqual(5);
      });
    });

    describe('when withHeaderRow = false', () => {
      it('should create a table node without header rows', () => {
        const {
          state: { schema }
        } = createEditor(doc(p('')));
        const table = createTable(schema, 3, 3, false);
        expect(table.content.child(0).child(0).type).toEqual(
          schema.nodes.table_cell
        );
      });
    });

    describe('when withDefaultNonWidthChar = true', () => {
      it('should adds empty paragraph to all cells', () => {
        const {
          state: { schema }
        } = createEditor(doc(p('')));
        const emptyParagraph = createEmptyParagraph(schema);
        const tableResult = createTable(schema, 3, 3, true, emptyParagraph);
        expect(tableResult.content.childCount).toEqual(3);

        expect(tableResult).toEqualDocument(
          table(
            row(thWithNonWidthChar, thWithNonWidthChar, thWithNonWidthChar),
            row(tdWithNonWidthChar, tdWithNonWidthChar, tdWithNonWidthChar),
            row(tdWithNonWidthChar, tdWithNonWidthChar, tdWithNonWidthChar)
          )
        );
      });
    });

    describe('when withDefaultNonWidthChar = false', () => {
      it('should adds empty paragraph to all cells', () => {
        const {
          state: { schema }
        } = createEditor(doc(p('')));
        const tableResult = createTable(schema, 3, 3, true);
        expect(tableResult.content.childCount).toEqual(3);

        expect(tableResult).toEqualDocument(
          table(
            row(thEmpty, thEmpty, thEmpty),
            row(tdEmpty, tdEmpty, tdEmpty),
            row(tdEmpty, tdEmpty, tdEmpty)
          )
        );
      });
    });
  });

  describe('findCellClosestToPos', () => {
    it('should return a cell object closest to a given `$pos`', () => {
      const {
        state: { tr }
      } = createEditor(
        doc(
          table(row(td(p('one one')), tdEmpty), row(td(p('two two')), tdEmpty))
        )
      );
      const cell = findCellClosestToPos(tr.doc.resolve(4));
      expect(cell.node.type.name).toEqual('table_cell');
      expect(cell.pos).toEqual(2);
    });

    it('should return `undefined` if there is no cell close to a given `$pos`', () => {
      const {
        state: { tr }
      } = createEditor(doc(p('one')));
      const cell = findCellClosestToPos(tr.doc.resolve(4));
      expect(cell).toBeUndefined();
    });
  });

  describe('findCellRectClosestToPos', () => {
    it('should return `undefined` if there is no cell close to a given `$pos`', () => {
      const {
        state: { tr }
      } = createEditor(doc(p('one')));
      const rect = findCellRectClosestToPos(tr.doc.resolve(4));
      expect(rect).toBeUndefined();
    });

    it('should return a cell object closest to a given `$pos`', () => {
      const {
        state: { tr }
      } = createEditor(
        doc(
          table(
            row(tdEmpty, tdEmpty, tdEmpty),
            row(tdEmpty, tdEmpty, tdCursor),
            row(tdEmpty, tdEmpty, tdEmpty)
          )
        )
      );
      const rect = findCellRectClosestToPos(tr.selection.$from);
      expect(rect.top).toEqual(1);
      expect(rect.bottom).toEqual(2);
      expect(rect.left).toEqual(2);
      expect(rect.right).toEqual(3);
    });
  });

  describe('getSelectionRect', () => {
    it('should return `undefined` if there selection is not a CellSelection', () => {
      const {
        state: { selection }
      } = createEditor(doc(p('one')));
      const rect = getSelectionRect(selection);
      expect(rect).toBeUndefined();
    });

    it('should return selection rect if selection is a CellSelection', () => {
      const {
        state: { selection }
      } = createEditor(
        doc(
          table(
            row(td(p('<anchor>')), tdEmpty, tdEmpty),
            row(tdEmpty, tdEmpty, tdEmpty),
            row(tdEmpty, td(p('<head>')), tdEmpty)
          )
        )
      );
      const rect = getSelectionRect(selection);
      expect(rect.top).toEqual(0);
      expect(rect.bottom).toEqual(3);
      expect(rect.left).toEqual(0);
      expect(rect.right).toEqual(2);
    });
  });

  describe('getSelectionRangeInColumn', () => {
    describe('when columns are merged', () => {
      describe('1st combination of colspans', () => {
        it(`columnIndex: 0`, () => {
          const {
            state: { tr },
            anchorCell,
            headCell
          } = createEditor(
            doc(
              table(
                row(
                  td(p('<headCell>')),
                  tdEmpty,
                  td({ colspan: 2 }, p('')),
                  tdEmpty,
                  tdEmpty
                ),
                row(
                  tdEmpty,
                  tdEmpty,
                  td({ colspan: 2 }, p('')),
                  tdEmpty,
                  tdEmpty
                ),
                row(
                  td(p('<anchorCell>')),
                  tdEmpty,
                  tdEmpty,
                  tdEmpty,
                  td({ colspan: 2 }, p(''))
                )
              )
            )
          );
          const range = getSelectionRangeInColumn(0)(tr);
          expect(range.indexes).toEqual([0]);
          expect(range.$anchor.pos).toEqual(anchorCell - 2);
          expect(range.$head.pos).toEqual(headCell - 2);
        });
        Array.from(Array(4).keys()).forEach(columnIndex => {
          it(`columnIndex: ${columnIndex + 1}`, () => {
            const {
              state: { tr },
              anchorCell,
              headCell
            } = createEditor(
              doc(
                table(
                  row(
                    tdEmpty,
                    td({ colspan: 2 }, p('')),
                    tdEmpty,
                    td(p('<headCell>')),
                    tdEmpty
                  ),
                  row(
                    tdEmpty,
                    tdEmpty,
                    td({ colspan: 2 }, p('')),
                    tdEmpty,
                    tdEmpty
                  ),
                  row(
                    tdEmpty,
                    td(p('<anchorCell>')),
                    tdEmpty,
                    td({ colspan: 2 }, p('')),
                    tdEmpty
                  )
                )
              )
            );
            const range = getSelectionRangeInColumn(columnIndex + 1)(tr);
            expect(range.indexes).toEqual([1, 2, 3, 4]);
            expect(range.$anchor.pos).toEqual(anchorCell - 2);
            expect(range.$head.pos).toEqual(headCell - 2);
          });
        });
        it(`columnIndex: 5`, () => {
          const {
            state: { tr },
            anchorCell,
            headCell
          } = createEditor(
            doc(
              table(
                row(
                  tdEmpty,
                  td({ colspan: 2 }, p('')),
                  tdEmpty,
                  tdEmpty,
                  td(p('<headCell>'))
                ),
                row(
                  tdEmpty,
                  tdEmpty,
                  td({ colspan: 2 }, p('')),
                  tdEmpty,
                  tdEmpty
                ),
                row(
                  tdEmpty,
                  tdEmpty,
                  tdEmpty,
                  td({ colspan: 2 }, p('')),
                  td(p('<anchorCell>'))
                )
              )
            )
          );
          const range = getSelectionRangeInColumn(5)(tr);
          expect(range.indexes).toEqual([5]);
          expect(range.$anchor.pos).toEqual(anchorCell - 2);
          expect(range.$head.pos).toEqual(headCell - 2);
        });
      });
      describe('2nd combination of colspans', () => {
        it(`columnIndex: 0`, () => {
          const {
            state: { tr },
            anchorCell,
            headCell
          } = createEditor(
            doc(
              table(
                row(
                  td(p('<headCell>')),
                  tdEmpty,
                  tdEmpty,
                  tdEmpty,
                  td({ colspan: 2 }, p(''))
                ),
                row(
                  tdEmpty,
                  tdEmpty,
                  td({ colspan: 2 }, p('')),
                  tdEmpty,
                  tdEmpty
                ),
                row(
                  td(p('<anchorCell>')),
                  tdEmpty,
                  td({ colspan: 2 }, p('')),
                  tdEmpty,
                  tdEmpty
                )
              )
            )
          );
          const range = getSelectionRangeInColumn(0)(tr);
          expect(range.indexes).toEqual([0]);
          expect(range.$anchor.pos).toEqual(anchorCell - 2);
          expect(range.$head.pos).toEqual(headCell - 2);
        });
        Array.from(Array(4).keys()).forEach(columnIndex => {
          it(`columnIndex: ${columnIndex + 1}`, () => {
            const {
              state: { tr },
              anchorCell,
              headCell
            } = createEditor(
              doc(
                table(
                  row(
                    tdEmpty,
                    tdEmpty,
                    tdEmpty,
                    td({ colspan: 2 }, p('<headCell>')),
                    tdEmpty
                  ),
                  row(
                    tdEmpty,
                    tdEmpty,
                    td({ colspan: 2 }, p('')),
                    tdEmpty,
                    tdEmpty
                  ),
                  row(
                    tdEmpty,
                    td({ colspan: 2 }, p('<anchorCell>')),
                    tdEmpty,
                    tdEmpty,
                    tdEmpty
                  )
                )
              )
            );
            const range = getSelectionRangeInColumn(columnIndex + 1)(tr);
            expect(range.indexes).toEqual([1, 2, 3, 4]);
            expect(range.$anchor.pos).toEqual(anchorCell - 2);
            expect(range.$head.pos).toEqual(headCell - 2);
          });
        });
        it(`columnIndex: 5`, () => {
          const {
            state: { tr },
            anchorCell,
            headCell
          } = createEditor(
            doc(
              table(
                row(
                  tdEmpty,
                  tdEmpty,
                  tdEmpty,
                  td({ colspan: 2 }, p('')),
                  td(p('<headCell>'))
                ),
                row(
                  tdEmpty,
                  tdEmpty,
                  td({ colspan: 2 }, p('')),
                  tdEmpty,
                  tdEmpty
                ),
                row(
                  tdEmpty,
                  td({ colspan: 2 }, p('')),
                  tdEmpty,
                  tdEmpty,
                  td(p('<anchorCell>'))
                )
              )
            )
          );
          const range = getSelectionRangeInColumn(5)(tr);
          expect(range.indexes).toEqual([5]);
          expect(range.$anchor.pos).toEqual(anchorCell - 2);
          expect(range.$head.pos).toEqual(headCell - 2);
        });
      });
    });
    describe('when columns and rows are merged', () => {
      describe('1st combination of colspans and rowspans', () => {
        it(`columnIndex: 0`, () => {
          const {
            state: { tr },
            anchorCell,
            headCell
          } = createEditor(
            doc(
              table(
                row(
                  td(p('<headCell>')),
                  td({ rowspan: 2 }, p('')),
                  tdEmpty,
                  tdEmpty,
                  tdEmpty
                ),
                row(tdEmpty, td({ colspan: 2 }, p('')), tdEmpty),
                row(
                  tdEmpty,
                  td({ colspan: 2 }, p('')),
                  td({ rowspan: 2 }, p('')),
                  tdEmpty
                ),
                row(td(p('<anchorCell>')), tdEmpty, tdEmpty, tdEmpty)
              )
            )
          );
          const range = getSelectionRangeInColumn(0)(tr);
          expect(range.indexes).toEqual([0]);
          expect(range.$anchor.pos).toEqual(anchorCell - 2);
          expect(range.$head.pos).toEqual(headCell - 2);
        });
        Array.from(Array(3).keys()).forEach(columnIndex => {
          it(`columnIndex: ${columnIndex + 1}`, () => {
            const {
              state: { tr },
              anchorCell,
              headCell
            } = createEditor(
              doc(
                table(
                  row(
                    tdEmpty,
                    td({ rowspan: 2 }, p('')),
                    tdEmpty,
                    td(p('<headCell>')),
                    tdEmpty
                  ),
                  row(tdEmpty, td({ colspan: 2 }, p('')), tdEmpty),
                  row(
                    tdEmpty,
                    td({ colspan: 2 }, p('')),
                    td({ rowspan: 2 }, p('')),
                    tdEmpty
                  ),
                  row(tdEmpty, td(p('<anchorCell>')), tdEmpty, tdEmpty)
                )
              )
            );
            const range = getSelectionRangeInColumn(columnIndex + 1)(tr);
            expect(range.indexes).toEqual([1, 2, 3]);
            expect(range.$anchor.pos).toEqual(anchorCell - 2);
            expect(range.$head.pos).toEqual(headCell - 2);
          });
        });
        it(`columnIndex: 4`, () => {
          const {
            state: { tr },
            anchorCell,
            headCell
          } = createEditor(
            doc(
              table(
                row(
                  tdEmpty,
                  td({ rowspan: 2 }, p('')),
                  tdEmpty,
                  tdEmpty,
                  td(p('<headCell>'))
                ),
                row(tdEmpty, td({ colspan: 2 }, p('')), tdEmpty),
                row(
                  tdEmpty,
                  td({ colspan: 2 }, p('')),
                  td({ rowspan: 2 }, p('')),
                  tdEmpty
                ),
                row(tdEmpty, tdEmpty, tdEmpty, td(p('<anchorCell>')))
              )
            )
          );
          const range = getSelectionRangeInColumn(4)(tr);
          expect(range.indexes).toEqual([4]);
          expect(range.$anchor.pos).toEqual(anchorCell - 2);
          expect(range.$head.pos).toEqual(headCell - 2);
        });
      });
      describe('2st combination of colspans and rowspans', () => {
        it(`columnIndex: 0`, () => {
          const {
            state: { tr },
            anchorCell,
            headCell
          } = createEditor(
            doc(
              table(
                row(
                  td(p('<headCell>')),
                  tdEmpty,
                  tdEmpty,
                  td({ rowspan: 2 }, p('')),
                  tdEmpty
                ),
                row(tdEmpty, td({ colspan: 2 }, p('')), tdEmpty),
                row(
                  tdEmpty,
                  td({ rowspan: 2 }, p('')),
                  td({ colspan: 2 }, p('')),
                  tdEmpty
                ),
                row(td(p('<anchorCell>')), tdEmpty, tdEmpty, tdEmpty)
              )
            )
          );
          const range = getSelectionRangeInColumn(0)(tr);
          expect(range.indexes).toEqual([0]);
          expect(range.$anchor.pos).toEqual(anchorCell - 2);
          expect(range.$head.pos).toEqual(headCell - 2);
        });
        Array.from(Array(3).keys()).forEach(columnIndex => {
          it(`columnIndex: ${columnIndex + 1}`, () => {
            const {
              state: { tr },
              anchorCell,
              headCell
            } = createEditor(
              doc(
                table(
                  row(
                    tdEmpty,
                    tdEmpty,
                    tdEmpty,
                    td({ rowspan: 2 }, p('<headCell>')),
                    tdEmpty
                  ),
                  row(tdEmpty, td({ colspan: 2 }, p('')), tdEmpty),
                  row(
                    tdEmpty,
                    td({ rowspan: 2 }, p('<anchorCell>')),
                    td({ colspan: 2 }, p('')),
                    tdEmpty
                  ),
                  row(tdEmpty, tdEmpty, tdEmpty, tdEmpty)
                )
              )
            );
            const range = getSelectionRangeInColumn(columnIndex + 1)(tr);
            expect(range.indexes).toEqual([1, 2, 3]);
            expect(range.$anchor.pos).toEqual(anchorCell - 2);
            expect(range.$head.pos).toEqual(headCell - 2);
          });
        });
        it(`columnIndex: 4`, () => {
          const {
            state: { tr },
            anchorCell,
            headCell
          } = createEditor(
            doc(
              table(
                row(
                  tdEmpty,
                  tdEmpty,
                  td({ rowspan: 2 }, p('')),
                  tdEmpty,
                  td(p('<headCell>'))
                ),
                row(tdEmpty, td({ colspan: 2 }, p('')), tdEmpty),
                row(
                  tdEmpty,
                  td({ rowspan: 2 }, p('')),
                  td({ colspan: 2 }, p('')),
                  tdEmpty
                ),
                row(tdEmpty, tdEmpty, tdEmpty, td(p('<anchorCell>')))
              )
            )
          );
          const range = getSelectionRangeInColumn(4)(tr);
          expect(range.indexes).toEqual([4]);
          expect(range.$anchor.pos).toEqual(anchorCell - 2);
          expect(range.$head.pos).toEqual(headCell - 2);
        });
      });
    });
  });

  describe('getSelectionRangeInRow', () => {
    describe('when rows are merged', () => {
      describe('1st combination of rowspans', () => {
        it(`rowIndex: 0`, () => {
          const {
            state: { tr },
            anchorCell,
            headCell
          } = createEditor(
            doc(
              table(
                row(td(p('<headCell>')), tdEmpty, td(p('<anchorCell>'))),
                row(td({ rowspan: 2 }, p('')), tdEmpty, tdEmpty),
                row(td({ rowspan: 2 }, p('')), tdEmpty),
                row(tdEmpty, td({ rowspan: 2 }, p(''))),
                row(tdEmpty, tdEmpty),
                row(tdEmpty, tdEmpty, tdEmpty)
              )
            )
          );
          const range = getSelectionRangeInRow(0)(tr);
          expect(range.indexes).toEqual([0]);
          expect(range.$anchor.pos).toEqual(anchorCell - 2);
          expect(range.$head.pos).toEqual(headCell - 2);
        });
        Array.from(Array(4).keys()).forEach(rowIndex => {
          it(`rowIndex: ${rowIndex + 1}`, () => {
            const {
              state: { tr },
              anchorCell,
              headCell
            } = createEditor(
              doc(
                table(
                  row(tdEmpty, tdEmpty, tdEmpty),
                  row(
                    td({ rowspan: 2 }, p('')),
                    tdEmpty,
                    td(p('<anchorCell>'))
                  ),
                  row(td({ rowspan: 2 }, p('')), tdEmpty),
                  row(tdEmpty, td({ rowspan: 2 }, p(''))),
                  row(td(p('<headCell>')), tdEmpty),
                  row(tdEmpty, tdEmpty, tdEmpty)
                )
              )
            );
            const range = getSelectionRangeInRow(rowIndex + 1)(tr);
            expect(range.indexes).toEqual([1, 2, 3, 4]);
            expect(range.$anchor.pos).toEqual(anchorCell - 2);
            expect(range.$head.pos).toEqual(headCell - 2);
          });
        });
        it(`rowIndex: 5`, () => {
          const {
            state: { tr },
            anchorCell,
            headCell
          } = createEditor(
            doc(
              table(
                row(tdEmpty, tdEmpty, tdEmpty),
                row(td({ rowspan: 2 }, p('')), tdEmpty, tdEmpty),
                row(td({ rowspan: 2 }, p('')), tdEmpty),
                row(tdEmpty, td({ rowspan: 2 }, p(''))),
                row(tdEmpty, tdEmpty),
                row(td(p('<headCell>')), tdEmpty, td(p('<anchorCell>')))
              )
            )
          );
          const range = getSelectionRangeInRow(5)(tr);
          expect(range.indexes).toEqual([5]);
          expect(range.$anchor.pos).toEqual(anchorCell - 2);
          expect(range.$head.pos).toEqual(headCell - 2);
        });
      });
      describe('2nd combination of rowspans', () => {
        it(`rowIndex: 0`, () => {
          const {
            state: { tr },
            anchorCell,
            headCell
          } = createEditor(
            doc(
              table(
                row(td(p('<headCell>')), tdEmpty, td(p('<anchorCell>'))),
                row(tdEmpty, tdEmpty, td({ rowspan: 2 }, p(''))),
                row(tdEmpty, td({ rowspan: 2 }, p(''))),
                row(td({ rowspan: 2 }, p('')), tdEmpty),
                row(tdEmpty, tdEmpty),
                row(tdEmpty, tdEmpty, tdEmpty)
              )
            )
          );
          const range = getSelectionRangeInRow(0)(tr);
          expect(range.indexes).toEqual([0]);
          expect(range.$anchor.pos).toEqual(anchorCell - 2);
          expect(range.$head.pos).toEqual(headCell - 2);
        });
        Array.from(Array(4).keys()).forEach(rowIndex => {
          it(`rowIndex: ${rowIndex + 1}`, () => {
            const {
              state: { tr },
              anchorCell,
              headCell
            } = createEditor(
              doc(
                table(
                  row(tdEmpty, tdEmpty, tdEmpty),
                  row(tdEmpty, tdEmpty, td({ rowspan: 2 }, p('<anchorCell>'))),
                  row(tdEmpty, td({ rowspan: 2 }, p(''))),
                  row(td({ rowspan: 2 }, p('<headCell>')), tdEmpty),
                  row(tdEmpty, tdEmpty),
                  row(tdEmpty, tdEmpty, tdEmpty)
                )
              )
            );
            const range = getSelectionRangeInRow(rowIndex + 1)(tr);
            expect(range.indexes).toEqual([1, 2, 3, 4]);
            expect(range.$anchor.pos).toEqual(anchorCell - 2);
            expect(range.$head.pos).toEqual(headCell - 2);
          });
        });
        it(`rowIndex: 5`, () => {
          const {
            state: { tr },
            anchorCell,
            headCell
          } = createEditor(
            doc(
              table(
                row(tdEmpty, tdEmpty, tdEmpty),
                row(tdEmpty, tdEmpty, td({ rowspan: 2 }, p(''))),
                row(tdEmpty, td({ rowspan: 2 }, p(''))),
                row(td({ rowspan: 2 }, p('')), tdEmpty),
                row(tdEmpty, tdEmpty),
                row(td(p('<headCell>')), tdEmpty, td(p('<anchorCell>')))
              )
            )
          );
          const range = getSelectionRangeInRow(5)(tr);
          expect(range.indexes).toEqual([5]);
          expect(range.$anchor.pos).toEqual(anchorCell - 2);
          expect(range.$head.pos).toEqual(headCell - 2);
        });
      });
    });
    describe('when rows and columns are merged', () => {
      describe('1st combination of colspans and rowspans', () => {
        it(`rowIndex: 0`, () => {
          const {
            state: { tr },
            anchorCell,
            headCell
          } = createEditor(
            doc(
              table(
                row(td(p('<headCell>')), tdEmpty, td(p('<anchorCell>'))),
                row(td({ rowspan: 2 }, p('')), td({ colspan: 2 }, p(''))),
                row(td({ rowspan: 2 }, p('')), tdEmpty),
                row(tdEmpty, td({ rowspan: 2 }, p(''))),
                row(td({ colspan: 2 }, p(''))),
                row(tdEmpty, tdEmpty, tdEmpty)
              )
            )
          );
          const range = getSelectionRangeInRow(0)(tr);
          expect(range.indexes).toEqual([0]);
          expect(range.$anchor.pos).toEqual(anchorCell - 2);
          expect(range.$head.pos).toEqual(headCell - 2);
        });
        Array.from(Array(4).keys()).forEach(rowIndex => {
          it(`rowIndex: ${rowIndex + 1}`, () => {
            const {
              state: { tr },
              anchorCell,
              headCell
            } = createEditor(
              doc(
                table(
                  row(tdEmpty, tdEmpty, tdEmpty),
                  row(
                    td({ rowspan: 2 }, p('')),
                    td({ colspan: 2 }, p('<anchorCell>'))
                  ),
                  row(td({ rowspan: 2 }, p('')), tdEmpty),
                  row(tdEmpty, td({ rowspan: 2 }, p(''))),
                  row(td({ colspan: 2 }, p('<headCell>'))),
                  row(tdEmpty, tdEmpty, tdEmpty)
                )
              )
            );
            const range = getSelectionRangeInRow(rowIndex + 1)(tr);
            expect(range.indexes).toEqual([1, 2, 3, 4]);
            expect(range.$anchor.pos).toEqual(anchorCell - 2);
            expect(range.$head.pos).toEqual(headCell - 2);
          });
        });
        it(`rowIndex: 5`, () => {
          const {
            state: { tr },
            anchorCell,
            headCell
          } = createEditor(
            doc(
              table(
                row(tdEmpty, tdEmpty, tdEmpty),
                row(td({ rowspan: 2 }, p('')), td({ colspan: 2 }, p(''))),
                row(td({ rowspan: 2 }, p('')), tdEmpty),
                row(tdEmpty, td({ rowspan: 2 }, p(''))),
                row(td({ colspan: 2 }, p(''))),
                row(td(p('<headCell>')), tdEmpty, td(p('<anchorCell>')))
              )
            )
          );
          const range = getSelectionRangeInRow(5)(tr);
          expect(range.indexes).toEqual([5]);
          expect(range.$anchor.pos).toEqual(anchorCell - 2);
          expect(range.$head.pos).toEqual(headCell - 2);
        });
      });
      describe('2nd combination of colspans and rowspans', () => {
        it(`rowIndex: 0`, () => {
          const {
            state: { tr },
            anchorCell,
            headCell
          } = createEditor(
            doc(
              table(
                row(td(p('<headCell>')), tdEmpty, td(p('<anchorCell>'))),
                row(td({ colspan: 2 }, p('')), td({ rowspan: 2 }, p(''))),
                row(tdEmpty, td({ rowspan: 2 }, p(''))),
                row(td({ rowspan: 2 }, p('')), tdEmpty),
                row(td({ colspan: 2 }, p(''))),
                row(tdEmpty, tdEmpty, tdEmpty)
              )
            )
          );
          const range = getSelectionRangeInRow(0)(tr);
          expect(range.indexes).toEqual([0]);
          expect(range.$anchor.pos).toEqual(anchorCell - 2);
          expect(range.$head.pos).toEqual(headCell - 2);
        });
        Array.from(Array(4).keys()).forEach(rowIndex => {
          it(`rowIndex: ${rowIndex + 1}`, () => {
            const {
              state: { tr },
              anchorCell,
              headCell
            } = createEditor(
              doc(
                table(
                  row(tdEmpty, tdEmpty, tdEmpty),
                  row(
                    td({ colspan: 2 }, p('')),
                    td({ rowspan: 2 }, p('<anchorCell>'))
                  ),
                  row(tdEmpty, td({ rowspan: 2 }, p(''))),
                  row(td({ rowspan: 2 }, p('<headCell>')), tdEmpty),
                  row(td({ colspan: 2 }, p(''))),
                  row(tdEmpty, tdEmpty, tdEmpty)
                )
              )
            );
            const range = getSelectionRangeInRow(rowIndex + 1)(tr);
            expect(range.indexes).toEqual([1, 2, 3, 4]);
            expect(range.$anchor.pos).toEqual(anchorCell - 2);
            expect(range.$head.pos).toEqual(headCell - 2);
          });
        });
        it(`rowIndex: 5`, () => {
          const {
            state: { tr },
            anchorCell,
            headCell
          } = createEditor(
            doc(
              table(
                row(tdEmpty, tdEmpty, tdEmpty),
                row(td({ colspan: 2 }, p('')), td({ rowspan: 2 }, p(''))),
                row(tdEmpty, td({ rowspan: 2 }, p(''))),
                row(td({ rowspan: 2 }, p('')), tdEmpty),
                row(td({ colspan: 2 }, p(''))),
                row(td(p('<headCell>')), tdEmpty, td(p('<anchorCell>')))
              )
            )
          );
          const range = getSelectionRangeInRow(5)(tr);
          expect(range.indexes).toEqual([5]);
          expect(range.$anchor.pos).toEqual(anchorCell - 2);
          expect(range.$head.pos).toEqual(headCell - 2);
        });
      });
    });
  });
});
