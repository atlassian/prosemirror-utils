import {
  createEditor,
  doc,
  p,
  table,
  tr,
  td,
  th,
  tdCursor,
  tdEmpty
} from "../test-helpers";
import {
  findTable,
  isCellSelection,
  isColumnSelected,
  isRowSelected,
  isTableSelected,
  getCellsInColumn,
  getCellsInRow,
  getCellsInTable
} from "../src";

describe("table", () => {
  describe("findTable", () => {
    it("should find table node if cursor is inside of a table cell", () => {
      const { state: { selection } } = createEditor(doc(table(tr(tdCursor))));
      const { node } = findTable(selection);
      expect(node.type.name).toEqual("table");
    });
    it("should return `undefined` if there is no table parent node", () => {
      const { state: { selection } } = createEditor(doc(p("<cursor>")));
      const result = findTable(selection);
      expect(result).toBeUndefined();
    });
  });

  describe("isCellSelection", () => {
    it("should return `true` if current selection is a CellSelection", () => {
      const { state: { selection } } = createEditor(
        doc(table(tr(td(p("<anchor>")), td(p("<head>")))))
      );
      expect(isCellSelection(selection)).toBe(true);
    });
    it("should return `false` if current selection is not a CellSelection", () => {
      const { state: { selection } } = createEditor(doc(p("<cursor>")));
      expect(isCellSelection(selection)).toBe(false);
    });
  });

  describe("isColumnSelected", () => {
    it("should return `true` if CellSelection spans the entire column", () => {
      const { state: { selection } } = createEditor(
        doc(table(tr(td(p("<anchor>"))), tr(tdEmpty), tr(td(p("<head>")))))
      );
      expect(isColumnSelected(0)(selection)).toBe(true);
    });
    it("should return `false` if CellSelection does not span the entire column", () => {
      const { state: { selection } } = createEditor(
        doc(table(tr(td(p("<anchor>"))), tr(td(p("<head>"))), tr(tdEmpty)))
      );
      expect(isColumnSelected(0)(selection)).toBe(false);
    });
  });

  describe("isRowSelected", () => {
    it("should return `true` if CellSelection spans the entire row", () => {
      const { state: { selection } } = createEditor(
        doc(table(tr(td(p("<anchor>")), tdEmpty, td(p("<head>")))))
      );
      expect(isRowSelected(0)(selection)).toBe(true);
    });
    it("should return `false` if CellSelection does not span the entire row", () => {
      const { state: { selection } } = createEditor(
        doc(table(tr(td(p("<anchor>")), td(p("<head>")), tdEmpty)))
      );
      expect(isRowSelected(0)(selection)).toBe(false);
    });
  });

  describe("isTableSelected", () => {
    it("should return `true` if CellSelection spans the entire table", () => {
      const { state: { selection } } = createEditor(
        doc(
          table(
            tr(td(p("<anchor>")), tdEmpty, tdEmpty),
            tr(tdEmpty, tdEmpty, td(p("<head>")))
          )
        )
      );
      expect(isTableSelected(selection)).toBe(true);
    });
    it("should return `false` if CellSelection does not span the entire table", () => {
      const { state: { selection } } = createEditor(
        doc(
          table(
            tr(td(p("<anchor>")), tdEmpty, tdEmpty),
            tr(td(p("<head>")), tdEmpty, tdEmpty)
          )
        )
      );
      expect(isTableSelected(selection)).toBe(false);
    });
  });

  describe("getCellsInColumn", () => {
    it("should return `undefined` when cursor is outside of a table node", () => {
      const { state: { selection } } = createEditor(doc(p("<cursor>")));
      expect(getCellsInColumn(0)(selection)).toBeUndefined();
    });
    it("should return an array of cells in a column", () => {
      const { state: { selection } } = createEditor(
        doc(
          table(
            tr(td(p("1")), tdCursor, tdEmpty),
            tr(td(p("2")), tdEmpty, tdEmpty)
          )
        )
      );
      const cells = getCellsInColumn(0)(selection);
      cells.forEach((cell, i) => {
        expect(cell.node.type.name).toEqual("table_cell");
        expect(cell.node.textContent).toEqual(`${i + 1}`);
        expect(typeof cell.pos).toEqual("number");
      });
      expect(cells[0].pos).toEqual(2);
      expect(cells[1].pos).toEqual(17);
    });
  });

  describe("getCellsInRow", () => {
    it("should return `undefined` when cursor is outside of a table node", () => {
      const { state: { selection } } = createEditor(doc(p("<cursor>")));
      expect(getCellsInRow(0)(selection)).toBeUndefined();
    });
    it("should return an array of cells in a row", () => {
      const { state: { selection } } = createEditor(
        doc(
          table(
            tr(td(p("1")), td(p("2")), td(p("3"))),
            tr(tdCursor, tdEmpty, tdEmpty)
          )
        )
      );
      const cells = getCellsInRow(0)(selection);
      cells.forEach((cell, i) => {
        expect(cell.node.type.name).toEqual("table_cell");
        expect(cell.node.textContent).toEqual(`${i + 1}`);
        expect(typeof cell.pos).toEqual("number");
      });
      expect(cells[0].pos).toEqual(2);
      expect(cells[1].pos).toEqual(7);
      expect(cells[2].pos).toEqual(12);
    });
  });

  describe("getCellsInTable", () => {
    it("should return `undefined` when cursor is outside of a table node", () => {
      const { state: { selection } } = createEditor(doc(p("<cursor>")));
      expect(getCellsInTable(selection)).toBeUndefined();
    });
    it("should return an array of all cells", () => {
      const { state: { selection } } = createEditor(
        doc(
          table(
            tr(td(p("1<cursor>")), td(p("2")), td(p("3"))),
            tr(td(p("4")), td(p("5")), td(p("6")))
          )
        )
      );
      const cells = getCellsInTable(selection);
      cells.forEach((cell, i) => {
        expect(cell.node.type.name).toEqual("table_cell");
        expect(cell.node.textContent).toEqual(`${i + 1}`);
        expect(typeof cell.pos).toEqual("number");
      });
      expect(cells[0].pos).toEqual(2);
      expect(cells[1].pos).toEqual(7);
      expect(cells[2].pos).toEqual(12);
      expect(cells[3].pos).toEqual(19);
      expect(cells[4].pos).toEqual(24);
      expect(cells[5].pos).toEqual(29);
    });
  });
});
