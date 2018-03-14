import {
  createEditor,
  toEqualDocument,
  doc,
  p,
  strong,
  atom,
  table,
  tr as row,
  td,
  th,
  tdCursor,
  tdEmpty
} from "../test-helpers";
import { NodeSelection } from "prosemirror-state";
import {
  removeParentNodeOfType,
  replaceParentNodeOfType,
  removeSelectedNode,
  safeInsert
} from "../src";

describe("transforms", () => {
  describe("removeParentNodeOfType", () => {
    it("should return `undefined` if there is no parent node of a given NodeType", () => {
      const { state } = createEditor(doc(p("<cursor>")));
      const result = removeParentNodeOfType(state.schema.nodes.table)(state.tr);
      expect(result).toBeUndefined();
    });
    describe('when there is a p("one") before the table node and p("two") after', () => {
      it('should remove table and preserve p("one") and p("two")', () => {
        const { state } = createEditor(
          doc(p("one"), table(row(tdCursor)), p("two"))
        );
        const tr = removeParentNodeOfType(state.schema.nodes.table)(state.tr);
        toEqualDocument(tr.doc, doc(p("one"), p("two")));
      });
    });
  });

  describe("replaceParentNodeOfType", () => {
    it("should return `undefined` if there is no parent node of a given NodeType", () => {
      const { state } = createEditor(doc(p("<cursor>")));
      const node = state.schema.nodes.paragraph.createChecked(
        {},
        state.schema.text("new")
      );
      const result = replaceParentNodeOfType(state.schema.nodes.table, node)(
        state.tr
      );
      expect(result).toBeUndefined();
    });
    it("should return `undefined` if replacing is not possible", () => {
      const { state } = createEditor(
        doc(p("one"), table(row(tdCursor)), p("two"))
      );
      const node = state.schema.text("new");
      const result = replaceParentNodeOfType(state.schema.nodes.table, node)(
        state.tr
      );
      expect(result).toBeUndefined();
    });
    describe('when there is a p("one") before the table node and p("two") after', () => {
      it('should replace table with p("new") and preserve p("one") and p("two")', () => {
        const { state } = createEditor(
          doc(p("one"), table(row(tdCursor)), p("two"))
        );
        const node = state.schema.nodes.paragraph.createChecked(
          {},
          state.schema.text("new")
        );
        const tr = replaceParentNodeOfType(state.schema.nodes.table, node)(
          state.tr
        );
        toEqualDocument(tr.doc, doc(p("one"), p("new"), p("two")));
      });
    });
    describe("when there are tree paragraphs", () => {
      it('should replace the middle paragraph with p("new") and preserve p("one") and p("two")', () => {
        const { state } = createEditor(
          doc(p("one"), p("hello<cursor>there"), p("two"))
        );
        const node = state.schema.nodes.paragraph.createChecked(
          {},
          state.schema.text("new")
        );
        const tr = replaceParentNodeOfType(state.schema.nodes.paragraph, node)(
          state.tr
        );
        toEqualDocument(tr.doc, doc(p("one"), p("new"), p("two")));
      });
    });
    it("should be composable with other transforms", () => {
      const { state } = createEditor(
        doc(p("one"), table(row(tdCursor)), p("two"))
      );
      const { paragraph, table: tableNode } = state.schema.nodes;
      const node = paragraph.createChecked({}, state.schema.text("new"));

      let tr = replaceParentNodeOfType(tableNode, node)(state.tr);
      toEqualDocument(tr.doc, doc(p("one"), p("new"), p("two")));

      tr = removeParentNodeOfType(paragraph)(tr);
      toEqualDocument(tr.doc, doc(p("one"), p("two")));
    });
  });

  describe("removeSelectedNode", () => {
    it("should `undefined` if selection is not a NodeSelection", () => {
      const { state } = createEditor(doc(p("one")));
      const result = removeSelectedNode(state.tr);
      expect(result).toBeUndefined();
    });

    it("should remove selected inline node", () => {
      const { state } = createEditor(doc(p("one<node>", atom(), "two")));
      const tr = removeSelectedNode(state.tr);
      toEqualDocument(tr.doc, doc(p("onetwo")));
    });

    it("should remove selected block node", () => {
      const { state } = createEditor(doc(p("one"), p("test"), p("two")));
      let tr = state.tr.setSelection(NodeSelection.create(state.doc, 5));
      tr = removeSelectedNode(tr);
      toEqualDocument(tr.doc, doc(p("one"), p("two")));
    });
  });

  describe("safeInsert", () => {
    it("should insert a node if its allowed at the current cursor position", () => {
      const { state } = createEditor(doc(p("one<cursor>")));
      const node = state.schema.nodes.atom.createChecked();
      const tr = safeInsert(node)(state.tr);
      toEqualDocument(tr.doc, doc(p("one", atom())));
    });

    it("should insert a node after the parent node if its not allowed at the cursor position", () => {
      const { state } = createEditor(
        doc(p(strong("zero"), "o<cursor>ne"), p("three"))
      );
      const node = state.schema.nodes.paragraph.createChecked(
        {},
        state.schema.text("two")
      );
      const tr = safeInsert(node)(state.tr);
      toEqualDocument(
        tr.doc,
        doc(p(strong("zero"), "one"), p("two"), p("three"))
      );
    });
  });
});
