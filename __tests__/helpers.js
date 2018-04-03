import { createEditor, doc, p, strong, atom } from '../test-helpers';
import { Fragment } from 'prosemirror-model';
import { canInsert } from '../src';

describe('helpers', () => {
  describe('canInsert', () => {
    it('should return true if insertion of a given node is allowed at the current cursor position', () => {
      const { state } = createEditor(doc(p('one<cursor>')));
      const { selection: { $from } } = state;
      const node = state.schema.nodes.atom.createChecked();
      expect(canInsert($from, node)).toBe(true);
    });

    it('should return true if insertion of a given Fragment is allowed at the current cursor position', () => {
      const { state } = createEditor(doc(p('one<cursor>')));
      const { selection: { $from } } = state;
      const node = state.schema.nodes.atom.createChecked();
      expect(canInsert($from, Fragment.from(node))).toBe(true);
    });

    it('should return false a insertion of a given node is not allowed', () => {
      const { state } = createEditor(
        doc(p(strong('zero'), 'o<cursor>ne'), p('three'))
      );
      const { selection: { $from } } = state;
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
      const { selection: { $from } } = state;
      const node = state.schema.nodes.paragraph.createChecked(
        {},
        state.schema.text('two')
      );
      expect(canInsert($from, Fragment.from(node))).toBe(false);
    });
  });
});
