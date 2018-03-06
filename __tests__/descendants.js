import { createEditor, doc, p, table, tr, th, td, tdEmpty, tdCursor, atom, strong } from '../test-helpers';
import {
  flatten,
  findChildren,
  findTextNodes,
  findInlineNodes,
  findBlockNodes,
  findChildrenByAttr,
  findChildrenByType,
  findChildrenByMark,
  contains
} from '../src';

describe('descendants', () => {
  describe('flatten', () => {
    it('should throw an error if `node` param is missing', () => {
      expect(flatten).toThrow();
    });
    describe('when `descend` param = `false`', () => {
      it('should flatten a given node a single level deep', () => {
        const { state } = createEditor(doc(table(tr(tdEmpty), tr(tdEmpty), tr(tdEmpty))));
        const result = flatten(state.doc.firstChild, false);
        expect(result.length).toEqual(3);
        result.forEach(item => {
          expect(Object.keys(item)).toEqual(['node', 'pos']);
          expect(typeof item.pos).toEqual('number');
          expect(item.node.type.name).toEqual('table_row');
        });
      });
    });
    describe('when `descend` param is missing (defaults to `true`)', () => {
      it('should deep flatten a given node', () => {
        const { state } = createEditor(doc(table(tr(tdEmpty), tr(tdEmpty), tr(tdEmpty))));
        const result = flatten(state.doc.firstChild);
        expect(result.length).toEqual(9);
      });
    });
  });

  describe('findChildren', () => {
    it('should return an array of matched nodes `predicate` returns truthy for', () => {
      const { state } = createEditor(doc(table(tr(tdEmpty), tr(tdEmpty), tr(tdEmpty))));
      const result = findChildren(state.doc.firstChild, node => node.type === state.schema.nodes.paragraph);
      expect(result.length).toEqual(3);
      result.forEach(item => {
        expect(item.node.type.name).toEqual('paragraph');
      });
    });
    it('should return an empty array if `predicate` returns falthy', () => {
      const { state } = createEditor(doc(table(tr(tdEmpty))));
      const result = findChildren(state.doc.firstChild, node => node.type === state.schema.nodes.atom);
      expect(result.length).toEqual(0);
    });
  });

  describe('findTextNodes', () => {
    it('should return an empty array if a given node does not have text nodes', () => {
      const { state } = createEditor(doc(table(tr(tdEmpty))));
      const result = findTextNodes(state.doc.firstChild);
      expect(result.length).toEqual(0);
    });
    it('should return an array if text nodes of a given node', () => {
      const { state } = createEditor(doc(table(tr(td(p('one', atom(), 'two'), td(p('three')))))));
      const result = findTextNodes(state.doc.firstChild);
      expect(result.length).toEqual(3);
      result.forEach(item => {
        expect(item.node.isText).toBe(true);
      });
    });
  });

  describe('findBlockNodes', () => {
    it('should return an empty array if a given node does not have block nodes', () => {
      const { state } = createEditor(doc(p('')));
      const result = findBlockNodes(state.doc.firstChild);
      expect(result.length).toEqual(0);
    });
    it('should return an array if block nodes of a given node', () => {
      const { state } = createEditor(doc(table(tr(tdEmpty, tdEmpty))));
      const result = findBlockNodes(state.doc.firstChild);
      expect(result.length).toEqual(5);
      result.forEach(item => {
        expect(item.node.isBlock).toBe(true);
      });
    });
  });

  describe('findChildrenByAttr', () => {
    it('should return an empty array if a given node does not have nodes with the given attribute', () => {
      const { state } = createEditor(doc(p('')));
      const result = findChildrenByAttr(state.doc.firstChild, attrs => attrs && attrs.colspan === 2);
      expect(result.length).toEqual(0);
    });
    it('should return an array if child nodes with the given attribute', () => {
      const { state } = createEditor(
        doc(
          table(
            tr( tdEmpty, td({ colspan: 2 }, p('2')), td({ colspan: 3 }, p('3')) ),
            tr( td({ colspan: 2 }, p('2')), tdEmpty, tdEmpty )
          )
        )
      );
      const result = findChildrenByAttr(state.doc.firstChild, attrs => attrs.colspan === 2);
      expect(result.length).toEqual(2);
      result.forEach(item => {
        expect(item.node.attrs.colspan).toEqual(2);
      });
    });
  });

  describe('findChildrenByType', () => {
    it('should return an empty array if a given node does not have nodes of a given `nodeType`', () => {
      const { state } = createEditor(doc(p('')));
      const result = findChildrenByType(state.doc, state.schema.nodes.table);
      expect(result.length).toEqual(0);
    });
    it('should return an array if child nodes of a given `nodeType`', () => {
      const { state } = createEditor( doc(table(tr( tdEmpty, tdEmpty, tdEmpty ))) );
      const result = findChildrenByType(state.doc, state.schema.nodes.table_cell);
      expect(result.length).toEqual(3);
      result.forEach(item => {
        expect(item.node.type.name).toEqual('table_cell');
      });
    });
  });

  describe('findChildrenByMark', () => {
    it('should return an empty array if a given node does not have child nodes with the given mark', () => {
      const { state } = createEditor(doc(p('')));
      const result = findChildrenByMark(state.doc, state.schema.marks.strong);
      expect(result.length).toEqual(0);
    });
    it('should return an array if child nodes if a given node has child nodes with the given mark', () => {
      const { state } = createEditor( doc(table(tr( td(p(strong('one'), 'two')), tdEmpty, td(p('three', strong('four'))) ))) );
      const result = findChildrenByMark(state.doc, state.schema.marks.strong);
      expect(result.length).toEqual(2);
      result.forEach(item => {
        expect(item.node.marks[0].type.name).toEqual('strong');
      });
    });
  });

  describe('contains', () => {
    it('should return `false` if a given `node` does not contain nodes of a given `nodeType`', () => {
      const { state } = createEditor(doc(p('')));
      const result = contains(state.doc, state.schema.nodes.table);
      expect(result).toBe(false);
    });
    it('should return `true` if a given `node` contains nodes of a given `nodeType`', () => {
      const { state } = createEditor(doc(p('')));
      const result = contains(state.doc, state.schema.nodes.paragraph);
      expect(result).toBe(true);
    });
  });

});