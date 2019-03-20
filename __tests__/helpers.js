import { createEditor, doc, p, strong, atomInline } from '../test-helpers';
import { Fragment } from 'prosemirror-model';
import { canInsert, removeNodeAtPos, transpose } from '../src/helpers';

describe('helpers', () => {
  describe('transpose', () => {
    const arr = [
      ['a1', 'a2', 'a3'],
      ['b1', 'b2', 'b3'],
      ['c1', 'c2', 'c3'],
      ['d1', 'd2', 'd3']
    ];

    const expected = [
      ['a1', 'b1', 'c1', 'd1'],
      ['a2', 'b2', 'c2', 'd2'],
      ['a3', 'b3', 'c3', 'd3']
    ];

    it('should invert columns to rows', () => {
      expect(transpose(arr)).toEqual(expected);
    });

    it('should guarantee the reflection to be true ', () => {
      expect(transpose(expected)).toEqual(arr);
    });
  });

  describe('canInsert', () => {
    it('should return true if insertion of a given node is allowed at the current cursor position', () => {
      const { state } = createEditor(doc(p('one<cursor>')));
      const {
        selection: { $from }
      } = state;
      const node = state.schema.nodes.atomInline.createChecked();
      expect(canInsert($from, node)).toBe(true);
    });

    it('should return true if insertion of a given Fragment is allowed at the current cursor position', () => {
      const { state } = createEditor(doc(p('one<cursor>')));
      const {
        selection: { $from }
      } = state;
      const node = state.schema.nodes.atomInline.createChecked();
      expect(canInsert($from, Fragment.from(node))).toBe(true);
    });

    it('should return false a insertion of a given node is not allowed', () => {
      const { state } = createEditor(
        doc(p(strong('zero'), 'o<cursor>ne'), p('three'))
      );
      const {
        selection: { $from }
      } = state;
      const node = state.schema.nodes.paragraph.createChecked(
        {},
        state.schema.text('two')
      );
      expect(canInsert($from, node)).toBe(false);
    });

    it('should return false a insertion of a given Fragment is not allowed', () => {
      const { state } = createEditor(
        doc(p(strong('zero'), 'o<cursor>ne'), p('three'))
      );
      const {
        selection: { $from }
      } = state;
      const node = state.schema.nodes.paragraph.createChecked(
        {},
        state.schema.text('two')
      );
      expect(canInsert($from, Fragment.from(node))).toBe(false);
    });
  });

  describe('removeNodeAtPos', () => {
    it('should remove a block top level node at the given position', () => {
      const {
        state: { tr }
      } = createEditor(doc(p('x'), p('one')));
      const newTr = removeNodeAtPos(3)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(doc(p('x')));
    });

    it('should remove a nested inline node at the given position', () => {
      const {
        state: { tr }
      } = createEditor(doc(p('one', atomInline())));
      const newTr = removeNodeAtPos(4)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(doc(p('one')));
    });
  });
});
