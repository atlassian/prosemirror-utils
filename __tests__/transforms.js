import { createEditor, toEqualDocument, doc, p, atom, table, tr as row, td, th, tdCursor, tdEmpty } from '../test-helpers';
import { NodeSelection } from 'prosemirror-state';
import {
  removeParentNodeOfType,
  replaceParentNodeOfType,
  removeSelectedNode,
} from '../src';

describe('transforms', () => {
  describe('removeParentNodeOfType', () => {
    it('should return `undefined` if there is no parent node of a given NodeType', () => {
      const { state } = createEditor(doc(p('<cursor>')));
      const result = removeParentNodeOfType(state.schema.nodes.table)(state.tr);
      expect(result).toBeUndefined();
    });
    describe('when there is a p("one") before the table node and p("two") after', () => {
      it('should remove table and preserve p("one") and p("two")', () => {
        const { state } = createEditor(doc(p('one'), table(row(tdCursor)), p('two')));
        const tr = removeParentNodeOfType(state.schema.nodes.table)(state.tr);
        toEqualDocument(tr.doc, doc(p('one'), p('two')));
      });
    });
  });

  describe('replaceParentNodeOfType', () => {
    it('should return `undefined` if there is no parent node of a given NodeType', () => {
      const { state } = createEditor(doc(p('<cursor>')));
      const node = state.schema.nodes.paragraph.createChecked({}, state.schema.text('new'));
      const result = replaceParentNodeOfType(state.schema.nodes.table, node)(state.tr);
      expect(result).toBeUndefined();
    });
    it('should return `undefined` if replacing is not possible', () => {
      const { state } = createEditor(doc(p('one'), table(row(tdCursor)), p('two')));
      const node = state.schema.text('new');
      const result = replaceParentNodeOfType(state.schema.nodes.table, node)(state.tr);
      expect(result).toBeUndefined();
    });
    describe('when there is a p("one") before the table node and p("two") after', () => {
      it('should replace table with p("new") and preserve p("one") and p("two")', () => {
        const { state } = createEditor(doc(p('one'), table(row(tdCursor)), p('two')));
        const node = state.schema.nodes.paragraph.createChecked({}, state.schema.text('new'));
        const tr = replaceParentNodeOfType(state.schema.nodes.table, node)(state.tr);
        toEqualDocument(tr.doc, doc(p('one'), p('new'), p('two')));
      });
    });
    describe('when there are tree paragraphs', () => {
      it('should replace the middle paragraph with p("new") and preserve p("one") and p("two")', () => {
        const { state } = createEditor(doc(p('one'), p('hello<cursor>there'), p('two')));
        const node = state.schema.nodes.paragraph.createChecked({}, state.schema.text('new'));
        const tr = replaceParentNodeOfType(state.schema.nodes.paragraph, node)(state.tr);
        toEqualDocument(tr.doc, doc(p('one'), p('new'), p('two')));
      });
    });
    it('should be composable with other transforms', () => {
      const { state } = createEditor(doc(p('one'), table(row(tdCursor)), p('two')));
      const { paragraph, table: tableNode } = state.schema.nodes;
      const node = paragraph.createChecked({}, state.schema.text('new'));

      let tr = replaceParentNodeOfType(tableNode, node)(state.tr);
      toEqualDocument(tr.doc, doc(p('one'), p('new'), p('two')));

      tr = removeParentNodeOfType(paragraph)(tr);
      toEqualDocument(tr.doc, doc(p('one'), p('two')));
    });
  });

  describe('removeSelectedNode', () => {
    it('should remove selected inline node', () => {
      const { state } = createEditor(doc(p('one<node>',atom(),'two')));
      const tr = removeSelectedNode(state.tr);
      toEqualDocument(tr.doc, doc(p('onetwo')));
    });

    it('should remove selected block node', () => {
      const { state } = createEditor(doc(p('one'), p('test'), p('two')));
      let tr = state.tr.setSelection(NodeSelection.create(state.doc, 5));
      tr = removeSelectedNode(tr);
      toEqualDocument(tr.doc, doc(p('one'), p('two')));
    });
  });
});
