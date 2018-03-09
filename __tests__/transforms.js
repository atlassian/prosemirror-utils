import { createEditor, toEqualDocument, doc, p, table, tr as row, td, th, tdCursor, tdEmpty } from '../test-helpers';
import {
  removeParentNodeOfType,
  replaceParentNodeOfTypeWith,
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

  describe('replaceParentNodeOfTypeWith', () => {
    it('should return `undefined` if there is no parent node of a given NodeType', () => {
      const { state } = createEditor(doc(p('<cursor>')));
      const node = state.schema.nodes.paragraph.createChecked({}, state.schema.text('new'));
      const result = replaceParentNodeOfTypeWith(state.schema.nodes.table, node)(state.tr);
      expect(result).toBeUndefined();
    });
    it('should return `undefined` if replacing is not possible', () => {
      const { state } = createEditor(doc(p('one'), table(row(tdCursor)), p('two')));
      const node = state.schema.text('new');
      const result = replaceParentNodeOfTypeWith(state.schema.nodes.table, node)(state.tr);
      expect(result).toBeUndefined();
    });
    describe('when there is a p("one") before the table node and p("two") after', () => {
      it('should replace table with p("new") and preserve p("one") and p("two")', () => {
        const { state } = createEditor(doc(p('one'), table(row(tdCursor)), p('two')));
        const node = state.schema.nodes.paragraph.createChecked({}, state.schema.text('new'));
        const tr = replaceParentNodeOfTypeWith(state.schema.nodes.table, node)(state.tr);
        toEqualDocument(tr.doc, doc(p('one'), p('new'), p('two')));
      });
    });
    describe('when there are tree paragraphs', () => {
      it('should replace the middle paragraph with p("new") and preserve p("one") and p("two")', () => {
        const { state } = createEditor(doc(p('one'), p('hello<cursor>there'), p('two')));
        const node = state.schema.nodes.paragraph.createChecked({}, state.schema.text('new'));
        const tr = replaceParentNodeOfTypeWith(state.schema.nodes.paragraph, node)(state.tr);
        toEqualDocument(tr.doc, doc(p('one'), p('new'), p('two')));
      });
    });
    it('should be composable with other transforms', () => {
      const { state } = createEditor(doc(p('one'), table(row(tdCursor)), p('two')));
      const { paragraph, table: tableNode } = state.schema.nodes;
      const node = paragraph.createChecked({}, state.schema.text('new'));

      let tr = replaceParentNodeOfTypeWith(tableNode, node)(state.tr);
      toEqualDocument(tr.doc, doc(p('one'), p('new'), p('two')));

      tr = removeParentNodeOfType(paragraph)(tr);
      toEqualDocument(tr.doc, doc(p('one'), p('two')));
    });
  });
});
