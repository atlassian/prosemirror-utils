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
  safeInsert,
  replaceSelectedNode
} from "../src";

describe("transforms", () => {
  describe("removeParentNodeOfType", () => {
    it("should return an original transaction if there is no parent node of a given NodeType", () => {
      const { state: { schema, tr } } = createEditor(doc(p("<cursor>")));
      const newTr = removeParentNodeOfType(schema.nodes.table)(tr);
      expect(tr).toBe(newTr);
    });
    describe('when there is a p("one") before the table node and p("two") after', () => {
      it('should remove table and preserve p("one") and p("two")', () => {
        const { state: { schema, tr } } = createEditor(
          doc(p("one"), table(row(tdCursor)), p("two"))
        );
        const newTr = removeParentNodeOfType(schema.nodes.table)(tr);
        expect(newTr).not.toBe(tr);
        toEqualDocument(newTr.doc, doc(p("one"), p("two")));
      });
    });
  });

  describe("replaceParentNodeOfType", () => {
    it("should return an original transaction if there is no parent node of a given NodeType", () => {
      const { state: { schema, tr } } = createEditor(doc(p("<cursor>")));
      const node = schema.nodes.paragraph.createChecked({}, schema.text("new"));
      const newTr = replaceParentNodeOfType(schema.nodes.table, node)(tr);
      expect(tr).toBe(newTr);
    });
    it("should return an original transaction if replacing is not possible", () => {
      const { state: { schema, tr } } = createEditor(
        doc(p("one"), table(row(tdCursor)), p("two"))
      );
      const node = schema.text("new");
      const newTr = replaceParentNodeOfType(schema.nodes.table, node)(tr);
      expect(tr).toBe(newTr);
    });
    describe('when there is a p("one") before the table node and p("two") after', () => {
      it('should replace table with p("new") and preserve p("one") and p("two")', () => {
        const { state: { schema, tr } } = createEditor(
          doc(p("one"), table(row(tdCursor)), p("two"))
        );
        const node = schema.nodes.paragraph.createChecked(
          {},
          schema.text("new")
        );
        const newTr = replaceParentNodeOfType(schema.nodes.table, node)(tr);
        expect(newTr).not.toBe(tr);
        toEqualDocument(newTr.doc, doc(p("one"), p("new"), p("two")));
      });
    });
    describe("when there are tree paragraphs", () => {
      it('should replace the middle paragraph with p("new") and preserve p("one") and p("two")', () => {
        const { state: { schema, tr } } = createEditor(
          doc(p("one"), p("hello<cursor>there"), p("two"))
        );
        const node = schema.nodes.paragraph.createChecked(
          {},
          schema.text("new")
        );
        const newTr = replaceParentNodeOfType(schema.nodes.paragraph, node)(tr);
        expect(newTr).not.toBe(tr);
        toEqualDocument(newTr.doc, doc(p("one"), p("new"), p("two")));
      });
    });
    it("should be composable with other transforms", () => {
      const { state: { schema, tr } } = createEditor(
        doc(p("one"), table(row(tdCursor)), p("two"))
      );
      const { paragraph, table: tableNode } = schema.nodes;
      const node = paragraph.createChecked({}, schema.text("new"));

      const newTr = replaceParentNodeOfType(tableNode, node)(tr);
      expect(newTr).not.toBe(tr);
      toEqualDocument(newTr.doc, doc(p("one"), p("new"), p("two")));

      const newTr2 = removeParentNodeOfType(paragraph)(newTr);
      expect(newTr2).not.toBe(newTr);
      toEqualDocument(newTr2.doc, doc(p("one"), p("two")));
    });
  });

  describe("removeSelectedNode", () => {
    it("should return an original transaction if selection is not a NodeSelection", () => {
      const { state: { tr } } = createEditor(doc(p("one")));
      const newTr = removeSelectedNode(tr);
      expect(newTr).toBe(tr);
    });

    it("should remove selected inline node", () => {
      const { state: { tr } } = createEditor(
        doc(p("one<node>", atom(), "two"))
      );
      const newTr = removeSelectedNode(tr);
      expect(newTr).not.toBe(tr);
      toEqualDocument(newTr.doc, doc(p("onetwo")));
    });

    it("should remove selected block node", () => {
      const { state } = createEditor(doc(p("one"), p("test"), p("two")));
      const tr = state.tr.setSelection(NodeSelection.create(state.doc, 5));
      const newTr = removeSelectedNode(tr);
      expect(newTr).not.toBe(tr);
      toEqualDocument(newTr.doc, doc(p("one"), p("two")));
    });
  });

  describe("safeInsert", () => {
    it("should insert a node if its allowed at the current cursor position", () => {
      const { state: { schema, tr } } = createEditor(doc(p("one<cursor>")));
      const node = schema.nodes.atom.createChecked();
      const newTr = safeInsert(node)(tr);
      expect(newTr).not.toBe(tr);
      toEqualDocument(newTr.doc, doc(p("one", atom())));
    });

    it("should insert a node after the parent node if its not allowed at the cursor position", () => {
      const { state: { schema, tr } } = createEditor(
        doc(p(strong("zero"), "o<cursor>ne"), p("three"))
      );
      const node = schema.nodes.paragraph.createChecked({}, schema.text("two"));
      const newTr = safeInsert(node)(tr);
      expect(newTr).not.toBe(tr);
      toEqualDocument(
        newTr.doc,
        doc(p(strong("zero"), "one"), p("two"), p("three"))
      );
    });
  });

  describe("replaceSelectedNode", () => {
    it("should return an original transaction if current selection is not a NodeSelection", () => {
      const { state: { schema, tr } } = createEditor(doc(p("<cursor>")));
      const node = schema.nodes.paragraph.createChecked({}, schema.text("new"));
      const newTr = replaceSelectedNode(node)(tr);
      expect(tr).toBe(newTr);
    });
    it("should return an original transaction if replacing is not possible", () => {
      const { state } = createEditor(doc(p("one")));
      const tr = state.tr.setSelection(NodeSelection.create(state.doc, 0));
      const node = state.schema.text("new");
      const newTr = replaceSelectedNode(node)(tr);
      expect(tr).toBe(newTr);
    });

    it("should replace selected node with the given `node`", () => {
      const { state } = createEditor(doc(p("one"), p("test"), p("two")));
      const tr = state.tr.setSelection(NodeSelection.create(state.doc, 5));
      const node = state.schema.nodes.paragraph.createChecked(
        {},
        state.schema.text("new")
      );
      const newTr = replaceSelectedNode(node)(tr);
      expect(newTr).not.toBe(tr);
      toEqualDocument(newTr.doc, doc(p("one"), p("new"), p("two")));
    });
  });
});
