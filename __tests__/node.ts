import { createEditor, testHelpers } from '../test-helpers';
import {
  flatten,
  findChildren,
  findTextNodes,
  findBlockNodes,
  findChildrenByAttr,
  findChildrenByType,
  findChildrenByMark,
  contains,
} from '../src';
const { blockquote, code, doc, p, atomInline, strong } = testHelpers;

describe('node', () => {
  describe('flatten', () => {
    it('should throw an error if `node` param is missing', () => {
      expect(flatten).toThrow();
    });
    describe('when `descend` param = `false`', () => {
      it('should flatten a given node a single level deep', () => {
        const { state } = createEditor(
          doc(blockquote(blockquote(p()), blockquote(p()), blockquote(p())))
        );
        const result = flatten(state.doc.firstChild!, false);
        expect(result.length).toEqual(3);
        result.forEach((item) => {
          expect(Object.keys(item)).toEqual(['node', 'pos']);
          expect(typeof item.pos).toEqual('number');
          expect(item.node.type.name).toEqual('blockquote');
        });
      });
    });
    describe('when `descend` param is missing (defaults to `true`)', () => {
      it('should deep flatten a given node', () => {
        const { state } = createEditor(
          doc(
            blockquote(
              blockquote(blockquote(p())),
              blockquote(blockquote(p())),
              blockquote(blockquote(p()))
            )
          )
        );
        const result = flatten(state.doc.firstChild!);
        expect(result.length).toEqual(9);
      });
    });
  });

  describe('findChildren', () => {
    it('should return an array of matched nodes `predicate` returns truthy for', () => {
      const { state } = createEditor(
        doc(blockquote(p(), p(), blockquote(p()), code()))
      );
      const result = findChildren(
        state.doc.firstChild!,
        (node) => node.type === state.schema.nodes.paragraph
      );
      expect(result.length).toEqual(3);
      result.forEach((item) => {
        expect(item.node.type.name).toEqual('paragraph');
      });
    });
    it('should return an empty array if `predicate` returns falthy', () => {
      const { state } = createEditor(doc(blockquote(p())));
      const result = findChildren(
        state.doc.firstChild!,
        (node) => node.type === state.schema.nodes.atomInline
      );
      expect(result.length).toEqual(0);
    });
  });

  describe('findTextNodes', () => {
    it('should return an empty array if a given node does not have text nodes', () => {
      const { state } = createEditor(doc(blockquote(p())));
      const result = findTextNodes(state.doc.firstChild!);
      expect(result.length).toEqual(0);
    });
    it('should return an array if text nodes of a given node', () => {
      const { state } = createEditor(
        doc(blockquote(p('one', atomInline(), 'two'), p('three')))
      );
      const result = findTextNodes(state.doc.firstChild!);
      expect(result.length).toEqual(3);
      result.forEach((item) => {
        expect(item.node.isText).toBe(true);
      });
    });
  });

  describe('findBlockNodes', () => {
    it('should return an empty array if a given node does not have block nodes', () => {
      const { state } = createEditor(doc(p('')));
      const result = findBlockNodes(state.doc.firstChild!);
      expect(result.length).toEqual(0);
    });
    it('should return an array if block nodes of a given node', () => {
      const { state } = createEditor(doc(blockquote(p(), p())));
      const result = findBlockNodes(state.doc);
      expect(result.length).toEqual(3);
      result.forEach((item) => {
        expect(item.node.isBlock).toBe(true);
      });
    });
  });

  describe('findChildrenByAttr', () => {
    it('should return an empty array if a given node does not have nodes with the given attribute', () => {
      const { state } = createEditor(doc(p('')));
      const result = findChildrenByAttr(
        state.doc.firstChild!,
        (attrs) => attrs && attrs.colspan === 2
      );
      expect(result.length).toEqual(0);
    });
    it('should return an array if child nodes with the given attribute', () => {
      const { state } = createEditor(
        doc(
          blockquote(
            p(),
            p(atomInline({ color: 'red' })),
            p(atomInline({ color: 'green' })),
            p('3')
          ),
          blockquote(p(atomInline({ color: 'red' })), p('2'), p(), p())
        )
      );
      const result = findChildrenByAttr(
        state.doc,
        (attrs) => attrs.color === 'red'
      );
      expect(result.length).toEqual(2);
      result.forEach((item) => {
        expect(item.node.attrs.color).toEqual('red');
      });
    });
  });

  describe('findChildrenByType', () => {
    it('should return an empty array if a given node does not have nodes of a given `nodeType`', () => {
      const { state } = createEditor(doc(p('')));
      const result = findChildrenByType(
        state.doc,
        state.schema.nodes.blockquote
      );
      expect(result.length).toEqual(0);
    });
    it('should return an array if child nodes of a given `nodeType`', () => {
      const { state } = createEditor(doc(blockquote(p(''), p(''), p(''))));
      const result = findChildrenByType(
        state.doc,
        state.schema.nodes.paragraph
      );
      expect(result.length).toEqual(3);
      result.forEach((item) => {
        expect(item.node.type.name).toEqual('paragraph');
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
      const { state } = createEditor(
        doc(
          blockquote(p(strong('one'), 'two')),
          blockquote(p('three', strong('four')))
        )
      );
      const result = findChildrenByMark(state.doc, state.schema.marks.strong);
      expect(result.length).toEqual(2);
      result.forEach((item) => {
        expect(item.node.marks[0].type.name).toEqual('strong');
      });
    });
  });

  describe('contains', () => {
    it('should return `false` if a given `node` does not contain nodes of a given `nodeType`', () => {
      const { state } = createEditor(doc(p('')));
      const result = contains(state.doc, state.schema.nodes.blockquote);
      expect(result).toBe(false);
    });
    it('should return `true` if a given `node` contains nodes of a given `nodeType`', () => {
      const { state } = createEditor(doc(p('')));
      const result = contains(state.doc, state.schema.nodes.paragraph);
      expect(result).toBe(true);
    });
  });
});
