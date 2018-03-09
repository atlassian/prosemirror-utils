import { createEditor, toEqualDocument, doc, p, table, tr as row, td, th, tdCursor, tdEmpty } from '../test-helpers';
import {
  removeParentNodeOfType,
} from '../src';

describe('transforms', () => {
  describe('removeParentNodeOfType', () => {
    it('should return `undefined` if there is no parent node of a given NodeType', () => {
      const { state } = createEditor(doc(p('<cursor>')));
      const result = removeParentNodeOfType(state.schema.nodes.table)(state);
      expect(result).toBeUndefined();
    });
    describe('when there is a p("one") before the table node and p("two") after', () => {
      it('should remove table and preserve p("one") and p("two")', () => {
        const { state } = createEditor(doc(p('one'), table(row(tdCursor)), p('two')));
        const tr = removeParentNodeOfType(state.schema.nodes.table)(state);
        toEqualDocument(tr.doc, doc(p('one'), p('two')));
      });
    });
  });
});
