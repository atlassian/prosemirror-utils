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
import { moveRow } from '../src';

describe('table__moveRow', () => {
  describe('on a simple table', () => {
    it('should move row bottom-to-top', () => {
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

      const newTr = moveRow(2, 0)(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(td(p('3')), tdEmpty, tdEmpty),
            row(td(p('1')), tdCursor, tdEmpty),
            row(td(p('2')), tdEmpty, tdEmpty)
          )
        )
      );
    });

    it('should move row top-to-bottom', () => {
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

      const newTr = moveRow(1, 2)(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(td(p('1')), tdEmpty, tdEmpty),
            row(td(p('3')), tdEmpty, tdEmpty),
            row(td(p('2')), td(p('x')), tdEmpty)
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

      const newTr = moveRow(1, 0)(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(td(p('2')), tdCursor, tdEmpty),
            row(td(p('1')), td({ colspan: 2 }, p('merged cell'))),
            row(td(p('3')), tdEmpty, tdEmpty)
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

      const newTr = moveRow(1, 0)(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(td(p('2')), td({ colspan: 2 }, p('merged cell'))),
            row(td(p('1')), tdCursor, tdEmpty),
            row(td(p('3')), tdEmpty, tdEmpty)
          )
        )
      );
    });

    it('should move lines with columns merged at last line', () => {
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

      const newTr = moveRow(1, 0)(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(td(p('2')), tdEmpty, tdEmpty),
            row(td(p('1')), tdCursor, tdEmpty),
            row(td(p('3')), td({ colspan: 2 }, p('merged cell')))
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

      const newTr = moveRow(0, 2)(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(thEmpty, thEmpty, thEmpty),
            row(tdEmpty, tdEmpty, tdEmpty),
            row(td({ colspan: 2 }, p('merged cell')), tdEmpty)
          )
        )
      );
    });
  });

  describe('on a table with merged rows', () => {
    it('should move rows', () => {
      const {
        state: { tr },
      } = createEditor(
        doc(
          table(
            row(
              td({ rowspan: 2 }, p('---merged-row----')),
              td(p('0')),
              td(p('1'))
            ),
            row(td(p('2')), td(p('3'))),
            row(td(p('4')), td(p('5')), td(p('6')))
          )
        )
      );

      const newTr = moveRow(1, 2)(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(td(p('4')), td(p('5')), td(p('6'))),
            row(
              td({ rowspan: 2 }, p('---merged-row----')),
              td(p('0')),
              td(p('1'))
            ),
            row(td(p('2')), td(p('3')))
          )
        )
      );
    });

    describe('when there is multi rows merged', () => {
      it('should not move rows when there is no space to move', () => {
        const docOriginal = doc(
          table(
            row(
              td({ rowspan: 2 }, p('---merged-row----')),
              td(p('0')),
              td(p('1'))
            ),
            row(td(p('2')), td({ rowspan: 2 }, p('---merged-row----'))),
            row(td(p('4')), td(p('5')))
          )
        );
        const {
          state: { tr },
        } = createEditor(docOriginal);

        const newTr = moveRow(1, 2)(tr);
        expect(newTr.doc).toEqualDocument(docOriginal);
      });
    });

    it('should not move rows between two merged rows', () => {
      const {
        state: { tr },
      } = createEditor(
        doc(
          table(
            row(
              td({ rowspan: 2 }, p('---merged-row----')),
              td(p('0')),
              td(p('1'))
            ),
            row(td(p('2')), td({ rowspan: 2 }, p('---merged-row----'))),
            row(td(p('4')), td(p('5')))
          )
        )
      );

      const newTr = moveRow(0, 2)(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(
              td({ rowspan: 2 }, p('---merged-row----')),
              td(p('0')),
              td(p('1'))
            ),
            row(td(p('2')), td({ rowspan: 2 }, p('---merged-row----'))),
            row(td(p('4')), td(p('5')))
          )
        )
      );
    });
  });

  describe('on a complex table with merged columns and rows', () => {
    it('keep the merged content columns order', () => {
      const {
        state: { tr },
      } = createEditor(
        doc(
          table(
            row(tdEmpty, td(p('1')), td(p('2'))),
            row(tdEmpty, td({ colspan: 2 }, p('3'))),
            row(tdEmpty, td(p('4')), td(p('5')))
          )
        )
      );

      const newTr = moveRow(1, 0)(tr);
      expect(newTr.doc).toEqualDocument(
        doc(
          table(
            row(tdEmpty, td({ colspan: 2 }, p('3'))),
            row(tdEmpty, td(p('1')), td(p('2'))),
            row(tdEmpty, td(p('4')), td(p('5')))
          )
        )
      );
    });

    describe('when the all cells from first column are merged ', () => {
      it('should not move rows', () => {
        const {
          state: { tr },
        } = createEditor(
          doc(
            table(
              row(td({ rowspan: 3 }, p('merged cell'))),
              row(td(p('2')), tdCursor, tdEmpty),
              row(td(p('3')), tdEmpty, tdEmpty)
            )
          )
        );

        const newTr = moveRow(1, 0)(tr);
        expect(newTr.doc).toEqualDocument(
          doc(
            table(
              row(td({ rowspan: 3 }, p('merged cell'))),
              row(td(p('2')), tdCursor, tdEmpty),
              row(td(p('3')), tdEmpty, tdEmpty)
            )
          )
        );
      });
    });

    describe('table 3x5', () => {
      describe('should move', () => {
        const {
          state: { tr },
        } = createEditor(
          doc(
            table(
              row(
                td({ rowspan: 2 }, p('a1')),
                td(p('a1')),
                td(p('a2')),
                td(p('a3')),
                td(p('a4'))
              ),
              row(td({ colspan: 4 }, p('b1'))),
              row(
                td(p('c1')),
                td(p('c2')),
                td({ colspan: 2 }, p('c3')),
                td(p('c4'))
              )
            )
          )
        );
        const expectedResult = doc(
          table(
            row(
              td(p('c1')),
              td(p('c2')),
              td({ colspan: 2 }, p('c3')),
              td(p('c4'))
            ),
            row(
              td({ rowspan: 2 }, p('a1')),
              td(p('a1')),
              td(p('a2')),
              td(p('a3')),
              td(p('a4'))
            ),
            row(td({ colspan: 4 }, p('b1')))
          )
        );

        it('row 0 to 2', () => {
          let newTr = moveRow(0, 2)(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('row 1 to 2', () => {
          let newTr = moveRow(1, 2)(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('row 2 to 0', () => {
          let newTr = moveRow(2, 0)(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        describe('with tryToFit true', () => {
          it('row 2 to 1', () => {
            let newTr = moveRow(2, 1, { tryToFit: true })(tr);
            expect(newTr.doc).toEqualDocument(expectedResult);
          });
        });

        describe('with tryToFit false', () => {
          it('throw exeception on move row 2 to 1', () => {
            expect(moveRow(2, 1, { tryToFit: false }).bind(null, tr)).toThrow();
          });
        });
      });

      describe('should not move', () => {
        const {
          state: { tr },
        } = createEditor(
          doc(
            table(
              row(
                td({ rowspan: 2 }, p('M1')),
                td(p('0')),
                td(p('1')),
                td(p('2')),
                td(p('3'))
              ),
              row(
                td({ colspan: 2 }, p('4')),
                td({ rowspan: 2, colspan: 2 }, p('M2'))
              ),
              row(td(p('5')), td(p('6')), td(p('7')))
            )
          )
        );

        const expectedResult = doc(
          table(
            row(
              td({ rowspan: 2 }, p('M1')),
              td(p('0')),
              td(p('1')),
              td(p('2')),
              td(p('3'))
            ),
            row(
              td({ colspan: 2 }, p('4')),
              td({ rowspan: 2, colspan: 2 }, p('M2'))
            ),
            row(td(p('5')), td(p('6')), td(p('7')))
          )
        );

        it('row 0 to 1', () => {
          let newTr = moveRow(0, 1)(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('row 0 to 2', () => {
          let newTr = moveRow(0, 2)(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('row 1 to 0', () => {
          let newTr = moveRow(1, 0)(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('row 1 to 1', () => {
          let newTr = moveRow(1, 1)(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('row 1 to 2', () => {
          let newTr = moveRow(1, 2)(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('row 2 to 0', () => {
          let newTr = moveRow(2, 0)(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('row 2 to 1', () => {
          let newTr = moveRow(2, 1)(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('row 2 to 2', () => {
          let newTr = moveRow(2, 2)(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });
      });
    });

    describe('table 3x4', () => {
      describe('should move', () => {
        const {
          state: { tr },
        } = createEditor(
          doc(
            table(
              row(
                td({ rowspan: 2 }, p('M1')),
                td(p('0')),
                td(p('1')),
                td(p('2'))
              ),
              row(td({ colspan: 2 }, p('3')), td(p('m2'))),
              row(td({ colspan: 4 }, p('4')))
            )
          )
        );

        const expectedResult = doc(
          table(
            row(td({ colspan: 4 }, p('4'))),
            row(
              td({ rowspan: 2 }, p('M1')),
              td(p('0')),
              td(p('1')),
              td(p('2'))
            ),
            row(td({ colspan: 2 }, p('3')), td(p('m2')))
          )
        );

        it('row 0 to 2', () => {
          let newTr = moveRow(0, 2)(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('row 1 to 2', () => {
          let newTr = moveRow(1, 2)(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('row 2 to 0', () => {
          let newTr = moveRow(2, 0)(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        describe('with tryToFit true', () => {
          it('row 2 to 1', () => {
            let newTr = moveRow(2, 1, { tryToFit: true })(tr);
            expect(newTr.doc).toEqualDocument(expectedResult);
          });
        });

        describe('with tryToFit false', () => {
          it('throw exeception on move row 2 to 1', () => {
            expect(moveRow(2, 1, { tryToFit: false }).bind(null, tr)).toThrow();
          });
        });
      });

      describe('should not move', () => {
        const {
          state: { tr },
        } = createEditor(
          doc(
            table(
              row(
                td({ rowspan: 2 }, p('M1')),
                td(p('0')),
                td(p('1')),
                td(p('2'))
              ),
              row(td({ colspan: 2 }, p('3')), td({ rowspan: 2 }, p('m2'))),
              row(td(p('4')), td(p('5')), td(p('6')))
            )
          )
        );

        const expectedResult = doc(
          table(
            row(
              td({ rowspan: 2 }, p('M1')),
              td(p('0')),
              td(p('1')),
              td(p('2'))
            ),
            row(td({ colspan: 2 }, p('3')), td({ rowspan: 2 }, p('m2'))),
            row(td(p('4')), td(p('5')), td(p('6')))
          )
        );

        it('row 0 to 2', () => {
          let newTr = moveRow(0, 2)(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('row 0 to 1', () => {
          let newTr = moveRow(0, 1)(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('row 2 to 0', () => {
          let newTr = moveRow(2, 0)(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });

        it('row 1 to 0', () => {
          let newTr = moveRow(1, 0)(tr);
          expect(newTr.doc).toEqualDocument(expectedResult);
        });
      });
    });
  });

  describe('table 5x3 and move cell type', () => {
    const {
      state: { tr },
    } = createEditor(
      doc(
        table(
          row(th(p('1')), th(p('2')), th(p('===')), th(p('a')), th(p('b'))),
          row(td({ colspan: 2 }, p('3')), td(p('===')), td(p('c')), td(p('d'))),
          row(td(p('4')), td(p('5')), td(p('===')), td({ colspan: 2 }, p('E')))
        )
      )
    );

    it('should move row 2 to 0', () => {
      let newTr = moveRow(2, 0)(tr);
      const expectedResult = doc(
        table(
          row(th(p('4')), th(p('5')), th(p('===')), th({ colspan: 2 }, p('E'))),
          row(td(p('1')), td(p('2')), td(p('===')), td(p('a')), td(p('b'))),
          row(td({ colspan: 2 }, p('3')), td(p('===')), td(p('c')), td(p('d')))
        )
      );

      expect(newTr.doc).toEqualDocument(expectedResult);
    });

    it('should move row 0 to 2 and', () => {
      let newTr = moveRow(0, 2)(tr);
      const expectedResult = doc(
        table(
          row(th({ colspan: 2 }, p('3')), th(p('===')), th(p('c')), th(p('d'))),
          row(td(p('4')), td(p('5')), td(p('===')), td({ colspan: 2 }, p('E'))),
          row(td(p('1')), td(p('2')), td(p('===')), td(p('a')), td(p('b')))
        )
      );

      expect(newTr.doc).toEqualDocument(expectedResult);
    });
  });

  describe('with tryToFit true', () => {
    describe('overide the direction when move bottom-to-top', () => {
      // Original table
      //      ____________________________
      //     |      |             |      |
      //  0  |  A1  |     B1      |      |
      //     |______|______ ______|      |
      //     |      |      |      |  D1  |
      //  1  |  A2  |  B2  |  C2  |      |
      //     |______|______|______|______|
      //     |      |             |      |
      //  2  |  A3  |     B3      |      |
      //     |______|______ ______|      |
      //     |      |      |      |  D3  |
      //  3  |  A4  |  B4  |  C4  |      |
      //     |______|______|______|______|
      //     |      |      |             |
      //  4  |  A5  |  B5  |     C5      |
      //     |______|______|______ ______|
      const {
        state: { tr },
      } = createEditor(
        doc(
          table(
            row(
              td(p('A1')),
              td({ colspan: 2 }, p('B1')),
              td({ rowspan: 2 }, p('D1'))
            ),
            row(td(p('A2')), td(p('B2')), td(p('C2'))),
            row(
              td(p('A3')),
              td({ colspan: 2 }, p('B3')),
              td({ rowspan: 2 }, p('D3'))
            ),
            row(td(p('A4')), td(p('B4')), td(p('C4'))),
            row(td(p('A5')), td(p('B5')), td({ colspan: 2 }, p('C5')))
          )
        )
      );

      // Expected table after move row 4 to position 1 with default direction
      //      ____________________________
      //     |      |      |             |
      //  0  |  A5  |  B5  |     C5      |
      //     |______|______|______ ______|
      //     |      |             |      |
      //  1  |  A1  |     B1      |      |
      //     |______|______ ______|      |
      //     |      |      |      |  D1  |
      //  2  |  A2  |  B2  |  C2  |      |
      //     |______|______|______|______|
      //     |      |             |      |
      //  3  |  A3  |     B3      |      |
      //     |______|______ ______|      |
      //     |      |      |      |  D3  |
      //  4  |  A4  |  B4  |  C4  |      |
      //     |______|______|______|______|
      const expectedResultDefaultDirection = doc(
        table(
          row(td(p('A5')), td(p('B5')), td({ colspan: 2 }, p('C5'))),
          row(
            td(p('A1')),
            td({ colspan: 2 }, p('B1')),
            td({ rowspan: 2 }, p('D1'))
          ),
          row(td(p('A2')), td(p('B2')), td(p('C2'))),
          row(
            td(p('A3')),
            td({ colspan: 2 }, p('B3')),
            td({ rowspan: 2 }, p('D3'))
          ),
          row(td(p('A4')), td(p('B4')), td(p('C4')))
        )
      );

      // Expected table after move row 4 to position 1 with direction one
      //      ____________________________
      //     |      |             |      |
      //  0  |  A1  |     B1      |      |
      //     |______|______ ______|      |
      //     |      |      |      |  D1  |
      //  1  |  A2  |  B2  |  C2  |      |
      //     |______|______|______|______|
      //     |      |      |             |
      //  2  |  A5  |  B5  |     C5      |
      //     |______|______|______ ______|
      //     |      |             |      |
      //  3  |  A3  |     B3      |      |
      //     |______|______ ______|      |
      //     |      |      |      |  D3  |
      //  4  |  A4  |  B4  |  C4  |      |
      //     |______|______|______|______|
      const expectedResultDirectionOne = doc(
        table(
          row(
            td(p('A1')),
            td({ colspan: 2 }, p('B1')),
            td({ rowspan: 2 }, p('D1'))
          ),
          row(td(p('A2')), td(p('B2')), td(p('C2'))),
          row(td(p('A5')), td(p('B5')), td({ colspan: 2 }, p('C5'))),
          row(
            td(p('A3')),
            td({ colspan: 2 }, p('B3')),
            td({ rowspan: 2 }, p('D3'))
          ),
          row(td(p('A4')), td(p('B4')), td(p('C4')))
        )
      );

      it('should move row 4 to position 1 with default direction', () => {
        let newTr = moveRow(4, 1, { tryToFit: true })(tr);
        expect(newTr.doc).toEqualDocument(expectedResultDefaultDirection);
      });

      it('should move row 4 to position 1 with direction zero', () => {
        let newTr = moveRow(4, 1, { tryToFit: true, direction: 0 })(tr);
        expect(newTr.doc).toEqualDocument(expectedResultDefaultDirection);
      });

      it('should move row 4 to position 1 with direction -1', () => {
        let newTr = moveRow(4, 1, { tryToFit: true, direction: -1 })(tr);
        expect(newTr.doc).toEqualDocument(expectedResultDefaultDirection);
      });

      it('should move row 4 to position 1 with direction 1', () => {
        let newTr = moveRow(4, 1, { tryToFit: true, direction: 1 })(tr);
        expect(newTr.doc).toEqualDocument(expectedResultDirectionOne);
      });
    });

    describe('overide the direction when move top-to-bottom', () => {
      // Original table
      //      ____________________________
      //     |      |      |             |
      //  0  |  A1  |  B1  |     C1      |
      //     |______|______|______ ______|
      //     |      |             |      |
      //  1  |  A2  |     B2      |      |
      //     |______|______ ______|      |
      //     |      |      |      |  D2  |
      //  2  |  A3  |  B3  |  C3  |      |
      //     |______|______|______|______|
      //     |      |             |      |
      //  3  |  A4  |     B4      |      |
      //     |______|______ ______|      |
      //     |      |      |      |  D4  |
      //  4  |  A5  |  B5  |  C5  |      |
      //     |______|______|______|______|
      const {
        state: { tr },
      } = createEditor(
        doc(
          table(
            row(td(p('A1')), td(p('B1')), td({ colspan: 2 }, p('C1'))),
            row(
              td(p('A2')),
              td({ colspan: 2 }, p('B2')),
              td({ rowspan: 2 }, p('D2'))
            ),
            row(td(p('A3')), td(p('B3')), td(p('C3'))),
            row(
              td(p('A4')),
              td({ colspan: 2 }, p('B4')),
              td({ rowspan: 2 }, p('D4'))
            ),
            row(td(p('A5')), td(p('B5')), td(p('C5')))
          )
        )
      );

      // Expected table after move row 0 to position 4 with default direction
      //      ____________________________
      //     |      |             |      |
      //  0  |  A2  |     B2      |      |
      //     |______|______ ______|      |
      //     |      |      |      |  D2  |
      //  1  |  A3  |  B3  |  C3  |      |
      //     |______|______|______|______|
      //     |      |             |      |
      //  2  |  A4  |     B4      |      |
      //     |______|______ ______|      |
      //     |      |      |      |  D4  |
      //  3  |  A5  |  B5  |  C5  |      |
      //     |______|______|______|______|
      //     |      |      |             |
      //  4  |  A1  |  B1  |     C1      |
      //     |______|______|______ ______|
      const expectedResultDefaultDirection = doc(
        table(
          row(
            td(p('A2')),
            td({ colspan: 2 }, p('B2')),
            td({ rowspan: 2 }, p('D2'))
          ),
          row(td(p('A3')), td(p('B3')), td(p('C3'))),
          row(
            td(p('A4')),
            td({ colspan: 2 }, p('B4')),
            td({ rowspan: 2 }, p('D4'))
          ),
          row(td(p('A5')), td(p('B5')), td(p('C5'))),
          row(td(p('A1')), td(p('B1')), td({ colspan: 2 }, p('C1')))
        )
      );

      // Expected table after move row 0 to position 4 with -1 direction
      //      ____________________________
      //     |      |             |      |
      //  0  |  A2  |     B2      |      |
      //     |______|______ ______|      |
      //     |      |      |      |  D2  |
      //  1  |  A3  |  B3  |  C3  |      |
      //     |______|______|______|______|
      //     |      |      |             |
      //  2  |  A1  |  B1  |     C1      |
      //     |______|______|______ ______|
      //     |      |             |      |
      //  3  |  A4  |     B4      |      |
      //     |______|______ ______|      |
      //     |      |      |      |  D4  |
      //  4  |  A5  |  B5  |  C5  |      |
      //     |______|______|______|______|
      const expectedResultDirectionMinusOne = doc(
        table(
          row(
            td(p('A2')),
            td({ colspan: 2 }, p('B2')),
            td({ rowspan: 2 }, p('D2'))
          ),
          row(td(p('A3')), td(p('B3')), td(p('C3'))),
          row(td(p('A1')), td(p('B1')), td({ colspan: 2 }, p('C1'))),
          row(
            td(p('A4')),
            td({ colspan: 2 }, p('B4')),
            td({ rowspan: 2 }, p('D4'))
          ),
          row(td(p('A5')), td(p('B5')), td(p('C5')))
        )
      );

      it('should move row 0 to position 4 with default direction', () => {
        let newTr = moveRow(0, 4, { tryToFit: true })(tr);
        expect(newTr.doc).toEqualDocument(expectedResultDefaultDirection);
      });

      it('should move row 0 to position 4 with direction 0', () => {
        let newTr = moveRow(0, 4, { tryToFit: true, direction: 0 })(tr);
        expect(newTr.doc).toEqualDocument(expectedResultDefaultDirection);
      });

      it('should move row 0 to position 4 with direction 1', () => {
        let newTr = moveRow(0, 4, { tryToFit: true, direction: 1 })(tr);
        expect(newTr.doc).toEqualDocument(expectedResultDefaultDirection);
      });

      it('should move row 0 to position 4 with direction -1', () => {
        let newTr = moveRow(0, 4, { tryToFit: true, direction: -1 })(tr);
        expect(newTr.doc).toEqualDocument(expectedResultDirectionMinusOne);
      });
    });
  });
});
