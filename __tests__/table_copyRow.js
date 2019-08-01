import {
  createEditor,
  doc,
  p,
  table,
  tr as row,
  td,
  tdEmpty,
  thEmpty,
  th
} from '../test-helpers';
import { TableMap } from 'prosemirror-tables';
import { getCellsInRow, findTable, copyRow } from '../src';

describe('table', () => {
  describe('#copyRow', () => {
    it('should ignore colspan from previous row by default', () => {
      const {
        state: { tr },
        view
      } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td({ background: '#eeeaaa', colspan: 2 }, p('3')))
          )
        )
      );

      const newTr = copyRow(2, 1)(tr);
      const cells = getCellsInRow(2)(newTr.selection);

      expect(cells).toHaveLength(2);
    });

    it('should keep colspan on table headers', () => {
      const {
        state: { tr }
      } = createEditor(
        doc(
          table(
            row(td(p('1<cursor>')), td(p('2'))),
            row(td({ colspan: 2, pretty: true }, p('3')))
          )
        )
      );

      const options = {
        keepColspan: true
      };

      const newTr = copyRow(2, 1, options)(tr);

      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(td(p('1')), td(p('2'))),
            row(td({ colspan: 2, pretty: true }, p('3'))),
            row(td({ colspan: 2, pretty: true }, p()))
          )
        )
      );
    });

    it('should keep colspan', () => {
      const {
        state: { tr },
        view
      } = createEditor(
        doc(
          table(
            row(
              td({ rowspan: 2 }, p('a1')),
              td({ rowspan: 2 }, p('a2')),
              td(p('a3')),
              td(p('a4')),
              td(p('a5')),
              td(p('a6'))
            ),
            row(td({ colspan: 2 }, p('b1')), td({ colspan: 2 }, p('b2')))
          )
        )
      );

      const options = {
        keepColspan: true
      };

      const newTr = copyRow(2, 1, options)(tr);

      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(
              td({ rowspan: 2 }, p('a1')),
              td({ rowspan: 2 }, p('a2')),
              td(p('a3')),
              td(p('a4')),
              td(p('a5')),
              td(p('a6'))
            ),
            row(td({ colspan: 2 }, p('b1')), td({ colspan: 2 }, p('b2'))),
            row(
              tdEmpty,
              tdEmpty,
              td({ colspan: 2 }, p('')),
              td({ colspan: 2 }, p(''))
            )
          )
        )
      );
    });

    describe('clone row with cell with rowspan', () => {
      it('should keep rowspan case 1', () => {
        const {
          state: { tr },
          view
        } = createEditor(
          doc(
            table(
              row(
                td({ rowspan: 2 }, p('a1')),
                td({ rowspan: 2 }, p('a2')),
                td(p('a3')),
                td(p('a4'))
              ),
              row(td({ rowspan: 2 }, p('b1')), td(p('b2'))),
              row(td(p('c1')), td(p('c2')), td(p('c3')))
            )
          )
        );

        const newTr = copyRow(2, 1)(tr);

        expect(newTr.doc).toEqualDocument(
          doc(
            table(
              row(
                td({ rowspan: 2 }, p('a1')),
                td({ rowspan: 2 }, p('a2')),
                td(p('a3')),
                td(p('a4'))
              ),
              row(td({ rowspan: 3 }, p('b1')), td(p('b2'))),
              row(tdEmpty, tdEmpty, tdEmpty),
              row(td(p('c1')), td(p('c2')), td(p('c3')))
            )
          )
        );
      });

      it('should keep rowspan case 2', () => {
        const {
          state: { tr },
          view
        } = createEditor(
          doc(
            table(
              row(
                td({ rowspan: 3 }, p('a1')),
                td({ rowspan: 3 }, p('a2')),
                td(p('a3')),
                td(p('a4'))
              ),
              row(td({ rowspan: 2 }, p('b1')), td(p('b2'))),
              row(td(p('c1')))
            )
          )
        );

        const newTr = copyRow(2, 1)(tr);

        expect(newTr.doc).toEqualDocument(
          doc(
            table(
              row(
                td({ rowspan: 4 }, p('a1')),
                td({ rowspan: 4 }, p('a2')),
                td(p('a3')),
                td(p('a4'))
              ),
              row(td({ rowspan: 3 }, p('b1')), td(p('b2'))),
              row(tdEmpty),
              row(td(p('c1')))
            )
          )
        );
      });

      it('should not keep rowspan from last row', () => {
        const {
          state: { tr },
          view
        } = createEditor(
          doc(
            table(
              row(
                td({ rowspan: 3 }, p('a1')),
                td({ rowspan: 3 }, p('a2')),
                td(p('a3')),
                td(p('a4'))
              ),
              row(td({ rowspan: 2 }, p('b1')), td(p('b2'))),
              row(td(p('c1')))
            )
          )
        );

        const newTr = copyRow(3, 2)(tr);

        expect(newTr.doc).toEqualDocument(
          doc(
            table(
              row(
                td({ rowspan: 3 }, p('a1')),
                td({ rowspan: 3 }, p('a2')),
                td(p('a3')),
                td(p('a4'))
              ),
              row(td({ rowspan: 2 }, p('b1')), td(p('b2'))),
              row(td(p('c1'))),
              row(tdEmpty, tdEmpty, tdEmpty, tdEmpty)
            )
          )
        );
      });
    });

    describe('expandRowspanFromClonedRow', () => {
      let tr;

      beforeEach(() => {
        const editor = createEditor(
          doc(
            table(
              row(td(p('a1')), td(p('a2')), td(p('a3'))),
              row(td(p('b1')), td(p('b2')), td({ rowspan: 3 }, p('b3'))),
              row(td(p('c1')), td(p('c2'))),
              row(td(p('d1')), td({ rowspan: 2 }, p('d2'))),
              row(td(p('e1')), td(p('e2'))),
              row(td(p('f1')), td(p('f2')), td(p('f3')))
            )
          )
        );

        tr = editor.state.tr;
      });

      describe('with flag true', () => {
        it('should increase previous rowspan', () => {
          const newTr = copyRow(4, 3, { expandRowspanFromClonedRow: true })(tr);

          expect(newTr.doc).toEqualDocument(
            doc(
              table(
                row(td(p('a1')), td(p('a2')), td(p('a3'))),
                row(td(p('b1')), td(p('b2')), td({ rowspan: 4 }, p('b3'))),
                row(td(p('c1')), td(p('c2'))),
                row(td(p('d1')), td({ rowspan: 3 }, p('d2'))),
                row(tdEmpty),
                row(td(p('e1')), td(p('e2'))),
                row(td(p('f1')), td(p('f2')), td(p('f3')))
              )
            )
          );
        });
      });

      describe('with flag false', () => {
        it('should not increase previous rowspan', () => {
          const newTr = copyRow(4, 3)(tr);

          expect(newTr.doc).toEqualDocument(
            doc(
              table(
                row(td(p('a1')), td(p('a2')), td(p('a3'))),
                row(td(p('b1')), td(p('b2')), td({ rowspan: 3 }, p('b3'))),
                row(td(p('c1')), td(p('c2'))),
                row(td(p('d1')), td({ rowspan: 3 }, p('d2'))),
                row(tdEmpty, tdEmpty),
                row(td(p('e1')), td(p('e2'))),
                row(td(p('f1')), td(p('f2')), td(p('f3')))
              )
            )
          );
        });
      });
    });

    describe('getNewCell', () => {
      let tr;

      beforeEach(() => {
        ({
          state: { tr }
        } = createEditor(
          doc(
            table(
              row(td(p('a1')), td(p('a2')), td(p('a3'))),
              row(td(p('b1')), td(p('b2')), td(p('b3'))),
              row(td(p('c1')), td(p('c2')), td(p('c3')))
            )
          )
        ));
      });

      describe('when it returns null', () => {
        it('should create a empty row with empty cells', () => {
          const options = {
            getNewCell: () => {
              return null;
            }
          };

          const newTr = copyRow(0, 2, options)(tr);

          expect(newTr.doc).toEqualDocument(
            doc(
              table(
                row(tdEmpty, tdEmpty, tdEmpty),
                row(td(p('a1')), td(p('a2')), td(p('a3'))),
                row(td(p('b1')), td(p('b2')), td(p('b3'))),
                row(td(p('c1')), td(p('c2')), td(p('c3')))
              )
            )
          );
        });
      });

      describe('when it returns a valid cellNode', () => {
        it('should create the new row with the cell content', () => {
          const options = {
            getNewCell: cell => {
              return cell.type.createAndFill({}, p('---'));
            }
          };

          const newTr = copyRow(0, 2, options)(tr);

          expect(newTr.doc).toEqualDocument(
            doc(
              table(
                row(td(p('---')), td(p('---')), td(p('---'))),
                row(td(p('a1')), td(p('a2')), td(p('a3'))),
                row(td(p('b1')), td(p('b2')), td(p('b3'))),
                row(td(p('c1')), td(p('c2')), td(p('c3')))
              )
            )
          );
        });
      });

      describe('when getNewCell is null', () => {
        it('should use default attributes', () => {
          const newTr = copyRow(2, 1)(tr);
          const cells = getCellsInRow(2)(newTr.selection);

          expect(cells).toHaveLength(3);

          cells.forEach((cell, i) => {
            expect(cell.node.attrs.background).toEqual(false);
          });
        });
      });

      it('should not replace colspan', () => {
        const options = {
          getNewCell: cell => {
            return cell.type.createAndFill({ colspan: 3 });
          }
        };
        const newTr = copyRow(2, 1, options)(tr);
        const cells = getCellsInRow(2)(newTr.selection);

        expect(cells).toHaveLength(3);
        cells.forEach((cell, i) => {
          expect(cell.node.attrs.colspan).not.toEqual(3);
        });
      });

      it('should not replace rowspan', () => {
        const options = {
          getNewCell: cell => {
            return cell.type.createAndFill({ rowspan: 3 });
          }
        };
        const newTr = copyRow(2, 1, options)(tr);
        const cells = getCellsInRow(2)(newTr.selection);

        expect(cells).toHaveLength(3);
        cells.forEach((cell, i) => {
          expect(cell.node.attrs.colspan).not.toEqual(3);
        });
      });

      describe('change background attributes', () => {
        it('should use getNewCellAttributes to set the new attributes', () => {
          const options = {
            getNewCell: cell => {
              return cell.type.createAndFill({ background: '#ffffff' });
            }
          };
          const newTr = copyRow(2, 1, options)(tr);
          const cells = getCellsInRow(2)(newTr.selection);

          const expected = {
            background: '#ffffff'
          };

          expect(cells).toHaveLength(3);

          cells.forEach((cell, i) => {
            expect(cell.node.attrs.background).toEqual('#ffffff');
          });

          expect(newTr.doc).toEqualDocument(
            doc(
              table(
                row(td(p('a1')), td(p('a2')), td(p('a3'))),
                row(td(p('b1')), td(p('b2')), td(p('b3'))),
                row(
                  td({ background: '#ffffff' }, p('')),
                  td({ background: '#ffffff' }, p('')),
                  td({ background: '#ffffff' }, p(''))
                ),
                row(td(p('c1')), td(p('c2')), td(p('c3')))
              )
            )
          );
        });
      });
    });

    describe('table with header row', () => {
      it('should copy table header cell type', () => {
        const {
          state: { tr },
          view
        } = createEditor(
          doc(
            table(
              row(th(p('a1')), th(p('a2')), th(p('a3')), th(p('a4'))),
              row(td(p('b1')), td(p('b2')), td(p('b3')), td(p('b4')))
            )
          )
        );

        const options = {};

        const newTr = copyRow(1, 0, options)(tr);

        expect(newTr.doc).toEqualDocument(
          doc(
            table(
              row(th(p('a1')), th(p('a2')), th(p('a3')), th(p('a4'))),
              row(thEmpty, thEmpty, thEmpty, thEmpty),
              row(td(p('b1')), td(p('b2')), td(p('b3')), td(p('b4')))
            )
          )
        );
      });
    });

    describe('complex table', () => {
      it('should transform and keep the table', () => {
        const {
          state: { tr },
          view
        } = createEditor(
          doc(
            table(
              row(th(p('a1')), th(p('a2')), th(p('a3'))),
              row(td(p('b1')), td(p('b2')), td({ rowspan: 4 }, p('b3'))),
              row(td(p('c1')), td(p('c2'))),
              row(td(p('d1')), td({ rowspan: 3 }, p('d2'))),
              row(td(p('XXXX'))),
              row(td(p('e1')), td(p('e2'))),
              row(td(p('f1')), td(p('f2')), td(p('f3')))
            )
          )
        );
        const options = {
          expandRowspanFromClonedRow: false,
          keepColspan: true,
          getNewCell(cell) {
            return cell.type.createAndFill({ background: '#aaaeee' });
          }
        };

        const newTr = copyRow(5, 4, options)(tr);

        const newTable = findTable(newTr.selection);
        const map = TableMap.get(newTable.node);
        expect(map.problems).toBeNull();
        expect(newTr.doc).toEqualDocument(
          doc(
            table(
              row(th(p('a1')), th(p('a2')), th(p('a3'))),
              row(td(p('b1')), td(p('b2')), td({ rowspan: 4 }, p('b3'))),
              row(td(p('c1')), td(p('c2'))),
              row(td(p('d1')), td({ rowspan: 4 }, p('d2'))),
              row(td(p('XXXX'))),
              row(
                td({ background: '#aaaeee' }, p('')),
                td({ background: '#aaaeee' }, p(''))
              ),
              row(td(p('e1')), td(p('e2'))),
              row(td(p('f1')), td(p('f2')), td(p('f3')))
            )
          )
        );
      });
    });
  });
});
