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
} from '../test-helpers';
import { moveColumn } from '../src';

describe('table__moveColumn', () => {
  describe('on a simple table', () => {
    it('should move column right-to-left', () => {
      const {
        state: { tr },
      } = createEditor(
        doc(
          table(
            row(td(p('1')), tdCursor, tdEmpty),
            row(td(p('2')), tdEmpty, tdEmpty),
            row(td(p('3')), tdEmpty, tdEmpty)
          )
        )
      );

      const newTr = moveColumn(2, 0)(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(tdEmpty, td(p('1')), tdCursor),
            row(tdEmpty, td(p('2')), tdEmpty),
            row(tdEmpty, td(p('3')), tdEmpty)
          )
        )
      );
    });

    it('should move column left-to-right', () => {
      const {
        state: { tr },
      } = createEditor(
        doc(
          table(
            row(td(p('1')), tdEmpty, tdEmpty),
            row(td(p('2')), td(p('x')), tdEmpty),
            row(td(p('3')), tdEmpty, tdEmpty)
          )
        )
      );

      const newTr = moveColumn(1, 2)(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(td(p('1')), tdEmpty, tdEmpty),
            row(td(p('2')), tdEmpty, td(p('x'))),
            row(td(p('3')), tdEmpty, tdEmpty)
          )
        )
      );
    });
  });

  describe('on a table with merged cells', () => {
    it('should move columns merged at first line', () => {
      const {
        state: { tr },
      } = createEditor(
        doc(
          table(
            row(td(p('1')), td({ colspan: 2 }, p('merged cell'))),
            row(td(p('2')), tdCursor, tdEmpty),
            row(td(p('3')), tdEmpty, tdEmpty)
          )
        )
      );

      const newTr = moveColumn(1, 0)(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(td({ colspan: 2 }, p('merged cell')), td(p('1'))),
            row(tdEmpty, tdCursor, td(p('2'))),
            row(tdEmpty, tdEmpty, td(p('3')))
          )
        )
      );
    });

    it('should move columns merged at middle line', () => {
      const {
        state: { tr },
      } = createEditor(
        doc(
          table(
            row(td(p('1')), tdCursor, tdEmpty),
            row(td(p('2')), td({ colspan: 2 }, p('merged cell'))),
            row(td(p('3')), tdEmpty, tdEmpty)
          )
        )
      );

      const newTr = moveColumn(1, 0)(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(tdEmpty, tdCursor, td(p('1'))),
            row(td({ colspan: 2 }, p('merged cell')), td(p('2'))),
            row(tdEmpty, tdEmpty, td(p('3')))
          )
        )
      );
    });

    it('should move columns merged at last line', () => {
      const {
        state: { tr },
      } = createEditor(
        doc(
          table(
            row(td(p('1')), tdCursor, tdEmpty),
            row(td(p('2')), tdEmpty, tdEmpty),
            row(td(p('3')), td({ colspan: 2 }, p('merged cell')))
          )
        )
      );

      const newTr = moveColumn(1, 0)(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(tdEmpty, tdCursor, td(p('1'))),
            row(tdEmpty, tdEmpty, td(p('2'))),
            row(td({ colspan: 2 }, p('merged cell')), td(p('3')))
          )
        )
      );
    });

    it('should move and keep table headers', () => {
      const {
        state: { tr },
      } = createEditor(
        doc(
          table(
            row(th({ colspan: 2 }, p('merged cell')), thEmpty),
            row(tdEmpty, tdEmpty, tdEmpty),
            row(tdEmpty, tdEmpty, tdEmpty)
          )
        )
      );

      const newTr = moveColumn(0, 2)(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(thEmpty, th({ colspan: 2 }, p('merged cell'))),
            row(tdEmpty, tdEmpty, tdEmpty),
            row(tdEmpty, tdEmpty, tdEmpty)
          )
        )
      );
    });

    it('should move and keep columns headers', () => {
      const {
        state: { tr },
      } = createEditor(
        doc(
          table(
            row(thEmpty, thEmpty, thEmpty),
            row(th(p('b1')), tdEmpty, td(p('b2'))),
            row(thEmpty, tdEmpty, tdEmpty)
          )
        )
      );

      const newTr = moveColumn(2, 0)(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(thEmpty, thEmpty, thEmpty),
            row(th(p('b2')), td(p('b1')), tdEmpty),
            row(thEmpty, tdEmpty, tdEmpty)
          )
        )
      );
    });
  });

  describe('on a table with merged rows', () => {
    it('should move columns', () => {
      const {
        state: { tr },
      } = createEditor(
        doc(
          table(
            row(
              td({ rowspan: 2 }, p('---merged-row----')),
              td(p('a0')),
              td(p('a1'))
            ),
            row(td(p('b1')), td(p('b2'))),
            row(td(p('c1')), td(p('c2')), td(p('c3')))
          )
        )
      );

      const newTr = moveColumn(1, 2)(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(
              td({ rowspan: 2 }, p('---merged-row----')),
              td(p('a1')),
              td(p('a0'))
            ),
            row(td(p('b2')), td(p('b1'))),
            row(td(p('c1')), td(p('c3')), td(p('c2')))
          )
        )
      );
    });

    it('should move columns for multi rows merged', () => {
      const {
        state: { tr },
      } = createEditor(
        doc(
          table(
            row(td({ rowspan: 2 }, p('a1')), td(p('a1')), td(p('a2'))),
            row(td(p('b1')), td({ rowspan: 2 }, p('b2'))),
            row(td(p('c1')), td(p('c2')))
          )
        )
      );

      const newTr = moveColumn(1, 2)(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(td({ rowspan: 2 }, p('a1')), td(p('a2')), td(p('a1'))),
            row(td({ rowspan: 2 }, p('b2')), td(p('b1'))),
            row(td(p('c1')), td(p('c2')))
          )
        )
      );
    });

    it('should move columns between two merged rows', () => {
      const {
        state: { tr },
      } = createEditor(
        doc(
          table(
            row(td({ rowspan: 2 }, p('a1')), td(p('a2')), td(p('a3'))),
            row(td(p('b1')), td({ rowspan: 2 }, p('b2'))),
            row(td(p('c1')), td(p('c2')))
          )
        )
      );

      const newTr = moveColumn(0, 2)(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(td(p('a2')), td(p('a3')), td({ rowspan: 2 }, p('a1'))),
            row(td(p('b1')), td({ rowspan: 2 }, p('b2'))),
            row(td(p('c2')), td(p('c1')))
          )
        )
      );
    });
  });

  describe('on a complex table with merged cells and rows', () => {
    it('keep the merged content columns order', () => {
      const {
        state: { tr },
      } = createEditor(
        doc(
          table(
            row(tdEmpty, td(p('a1')), td(p('a2'))),
            row(tdEmpty, td({ colspan: 2 }, p('b1'))),
            row(tdEmpty, td(p('c1')), td(p('c2')))
          )
        )
      );

      const newTr = moveColumn(1, 0)(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(td(p('a1')), td(p('a2')), tdEmpty),
            row(td({ colspan: 2 }, p('b1')), tdEmpty),
            row(td(p('c1')), td(p('c2')), tdEmpty)
          )
        )
      );
    });

    describe('when the first line all columns are merged', () => {
      it('should not move columns', () => {
        const {
          state: { tr },
        } = createEditor(
          doc(
            table(
              row(td({ colspan: 3 }, p('a1'))),
              row(td(p('b1')), tdCursor, tdEmpty),
              row(td(p('c1')), tdEmpty, tdEmpty)
            )
          )
        );

        const newTr = moveColumn(1, 0)(tr);
        expect(newTr.doc).toEqualDocument(
          doc(
            table(
              row(td({ colspan: 3 }, p('a1'))),
              row(td(p('b1')), tdCursor, tdEmpty),
              row(td(p('c1')), tdEmpty, tdEmpty)
            )
          )
        );
      });
    });

    describe('table 3x5', () => {
      const {
        state: { tr },
      } = createEditor(
        doc(
          table(
            row(
              td({ rowspan: 2 }, p('a0')),
              td(p('a1')),
              td(p('a2')),
              td(p('a3')),
              td(p('a4'))
            ),
            row(
              td({ colspan: 2 }, p('b1')),
              td({ rowspan: 2, colspan: 2 }, p('b2'))
            ),
            row(td(p('c1')), td(p('c2')), td(p('c3')))
          )
        )
      );

      const expectedResult = doc(
        table(
          row(
            td({ rowspan: 2 }, p('a0')),
            td(p('a3')),
            td(p('a4')),
            td(p('a1')),
            td(p('a2'))
          ),
          row(
            td({ rowspan: 2, colspan: 2 }, p('b2')),
            td({ colspan: 2 }, p('b1'))
          ),
          row(td(p('c1')), td(p('c2')), td(p('c3')))
        )
      );

      describe('with tryToFit false', () => {
        it('should throw exeception on move column 1 to 3', () => {
          expect(moveColumn(1, 3, { tryToFit: false }).bind(null, tr)).toThrow(
            "Target position is invalid, you can't move the column 1 to 3, the target can't be split. You could use tryToFit option."
          );
        });

        it('should throw exeception on move column 2 to 3', () => {
          expect(moveColumn(2, 3, { tryToFit: false }).bind(null, tr)).toThrow(
            "Target position is invalid, you can't move the column 2 to 3, the target can't be split. You could use tryToFit option."
          );
        });

        it('should throw exeception on move column 3 to 2', () => {
          expect(
            moveColumn(3, 2, { tryToFit: false }).bind(null, tr)
          ).toThrow();
        });

        it('should move column 3 to 1', () => {
          let newTr = moveColumn(3, 1, { tryToFit: false })(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('should move column 4 to 1', () => {
          let newTr = moveColumn(4, 1, { tryToFit: false })(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });
      });

      describe('with tryToFit true', () => {
        it('should move column 1 to 3', () => {
          let newTr = moveColumn(1, 3, { tryToFit: true })(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('should move column 2 to 3', () => {
          let newTr = moveColumn(2, 3, { tryToFit: true })(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('should move column 2 to 4', () => {
          let newTr = moveColumn(2, 4, { tryToFit: true })(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('should move column 3 to 1', () => {
          let newTr = moveColumn(3, 1, { tryToFit: true })(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('should move column 3 to 2', () => {
          let newTr = moveColumn(3, 2, { tryToFit: true })(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('should move column 4 to 1', () => {
          let newTr = moveColumn(4, 1, { tryToFit: true })(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('should move column 4 to 2', () => {
          let newTr = moveColumn(4, 2, { tryToFit: true })(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });
      });
    });

    describe('table 3x4', () => {
      const {
        state: { tr },
      } = createEditor(
        doc(
          table(
            row(
              td({ rowspan: 2 }, p('a1')),
              td(p('a2')),
              td(p('a3')),
              td(p('a4'))
            ),
            row(td({ colspan: 2 }, p('b1')), td({ rowspan: 2 }, p('b2'))),
            row(td(p('c1')), td(p('c2')), td(p('c3')))
          )
        )
      );

      const expectedResult = doc(
        table(
          row(
            td(p('a2')),
            td(p('a3')),
            td({ rowspan: 2 }, p('a1')),
            td(p('a4'))
          ),
          row(td({ colspan: 2 }, p('b1')), td({ rowspan: 2 }, p('b2'))),
          row(td(p('c2')), td(p('c3')), td(p('c1')))
        )
      );

      describe('with tryToFit false', () => {
        it('should throw exeception on move column 0 to 1', () => {
          expect(
            moveColumn(0, 1, { tryToFit: false }).bind(null, tr)
          ).toThrow();
        });

        it('should move column 0 to 2', () => {
          let newTr = moveColumn(0, 2, { tryToFit: false })(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('should move column 2 to 0', () => {
          let newTr = moveColumn(2, 0, { tryToFit: false })(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('should move column 1 to 0', () => {
          let newTr = moveColumn(1, 0, { tryToFit: false })(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });
      });

      describe('with tryToFit true', () => {
        it('should move column 0 to 2', () => {
          let newTr = moveColumn(0, 2, { tryToFit: true })(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('should move column 0 to 1', () => {
          let newTr = moveColumn(0, 1, { tryToFit: true })(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('should move column 2 to 0', () => {
          let newTr = moveColumn(2, 0, { tryToFit: true })(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('should move column 1 to 0', () => {
          let newTr = moveColumn(1, 0, { tryToFit: true })(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });
      });
    });
  });

  describe('table 5x3', () => {
    const {
      state: { tr },
    } = createEditor(
      doc(
        table(
          row(th(p('a1')), th(p('a2')), th(p('a3')), th(p('a4')), th(p('a5'))),
          row(
            td({ colspan: 2 }, p('b1')),
            td(p('b2')),
            td(p('b3')),
            td(p('b4'))
          ),
          row(
            td(p('c1')),
            td(p('c2')),
            td(p('c3')),
            td({ colspan: 2 }, p('c4'))
          )
        )
      )
    );

    const expectedResult = doc(
      table(
        row(th(p('a3')), th(p('a1')), th(p('a2')), th(p('a4')), th(p('a5'))),
        row(td(p('b2')), td({ colspan: 2 }, p('b1')), td(p('b3')), td(p('b4'))),
        row(td(p('c3')), td(p('c1')), td(p('c2')), td({ colspan: 2 }, p('c4')))
      )
    );

    it('should move column 2 to 0', () => {
      let newTr = moveColumn(2, 0)(tr);
      expect(newTr.doc).toEqualDocument(expectedResult);
    });

    it('should move column 0 to 2', () => {
      let newTr = moveColumn(0, 2)(tr);
      expect(newTr.doc).toEqualDocument(expectedResult);
    });
  });

  describe('with tryToFit true', () => {
    describe('overide the direction when move right-to-left', () => {
      // Original table
      //
      //     0      1       2     3      4      5       6
      //   _________________________________________________
      //  |      |             |      |             |      |
      //  |  A1  |     B1      |  E1  |     F1      |  G1  |
      //  |______|______ ______|______|______ ______|______|
      //  |             |      |             |      |      |
      //  |     A2      |      |     D2      |      |  G2  |
      //  |______ ______|      |______ ______|      |______|
      //  |      |      |  C2  |      |      |  F2  |      |
      //  |  A3  |  B3  |      |  D3  |  E3  |      |  G3  |
      //  |______|______|______|______|______|______|______|
      //
      const {
        state: { tr },
      } = createEditor(
        doc(
          table(
            row(
              td(p('A1')),
              td({ colspan: 2 }, p('B1')),
              td(p('E1')),
              td({ colspan: 2 }, p('F1')),
              td(p('G1'))
            ),
            row(
              td({ colspan: 2 }, p('A2')),
              td({ rowspan: 2 }, p('C2')),
              td({ colspan: 2 }, p('D2')),
              td({ rowspan: 2 }, p('F2')),
              td(p('G2'))
            ),
            row(td(p('A3')), td(p('B3')), td(p('D3')), td(p('E3')), td(p('G3')))
          )
        )
      );

      // Expected table after move column 6 to position 2 with default direction
      //
      //     0      1       2     3      4      5       6
      //   _________________________________________________
      //  |      |      |             |      |             |
      //  |  G1  |  A1  |     B1      |  E1  |     F1      |
      //  |______|______|______ ______|______|______ ______|
      //  |      |             |      |             |      |
      //  |  G2  |     A2      |      |     D2      |      |
      //  |______|______ ______|      |______ ______|      |
      //  |      |      |      |  C2  |      |      |  F2  |
      //  |  G3  |  A3  |  B3  |      |  D3  |  E3  |      |
      //  |______|______|______|______|______|______|______|
      //
      const expectedResultDefaultDirection = doc(
        table(
          row(
            td(p('G1')),
            td(p('A1')),
            td({ colspan: 2 }, p('B1')),
            td(p('E1')),
            td({ colspan: 2 }, p('F1'))
          ),
          row(
            td(p('G2')),
            td({ colspan: 2 }, p('A2')),
            td({ rowspan: 2 }, p('C2')),
            td({ colspan: 2 }, p('D2')),
            td({ rowspan: 2 }, p('F2'))
          ),
          row(td(p('G3')), td(p('A3')), td(p('B3')), td(p('D3')), td(p('E3')))
        )
      );

      // Expected table after move column 6 to position 2 with direction 1
      //
      //     0      1       2     3      4      5       6
      //   _________________________________________________
      //  |      |             |      |      |             |
      //  |  A1  |     B1      |  G1  |  E1  |     F1      |
      //  |______|______ ______|______|______|______ ______|
      //  |             |      |      |             |      |
      //  |     A2      |      |  G2  |     D2      |      |
      //  |______ ______|      |______|______ ______|      |
      //  |      |      |  C2  |      |      |      |  F2  |
      //  |  A3  |  B3  |      |  G3  |  D3  |  E3  |      |
      //  |______|______|______|______|______|______|______|
      //
      const expectedResultMinusOneDirection = doc(
        table(
          row(
            td(p('A1')),
            td({ colspan: 2 }, p('B1')),
            td(p('G1')),
            td(p('E1')),
            td({ colspan: 2 }, p('F1'))
          ),
          row(
            td({ colspan: 2 }, p('A2')),
            td({ rowspan: 2 }, p('C2')),
            td(p('G2')),
            td({ colspan: 2 }, p('D2')),
            td({ rowspan: 2 }, p('F2'))
          ),
          row(td(p('A3')), td(p('B3')), td(p('G3')), td(p('D3')), td(p('E3')))
        )
      );

      it('should move row 6 to position 2 with direction 1', () => {
        let newTr = moveColumn(6, 2, { tryToFit: true, direction: 1 })(tr);
        expect(newTr.doc).toEqualDocument(expectedResultMinusOneDirection);
      });
    });
  });
});
