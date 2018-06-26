import { NodeSelection } from 'prosemirror-state';
import {
  createEditor,
  doc,
  p,
  table,
  tr,
  th,
  td,
  tdCursor,
  tdEmpty,
  blockquote,
  atomContainer,
  atomInline,
  atomBlock
} from '../test-helpers';
import {
  findParentNode,
  findParentDomRef,
  hasParentNode,
  findParentNodeOfType,
  hasParentNodeOfType,
  findParentDomRefOfType,
  findSelectedNodeOfType,
  findPositionOfNodeBefore,
  findDomRefAtPos,
  findParentNodeClosestToPos,
  findParentNodeOfTypeClosestToPos
} from '../src';

describe('selection', () => {
  describe('findParentNode', () => {
    it('should find parent node if cursor is directly inside it', () => {
      const {
        state: { schema, selection }
      } = createEditor(doc(p('hello <cursor>')));
      const { node } = findParentNode(
        node => node.type === schema.nodes.paragraph
      )(selection);
      expect(node.type.name).toEqual('paragraph');
    });
    it('should find parent node if cursor is inside nested child', () => {
      const {
        state: { schema, selection }
      } = createEditor(doc(table(tr(tdCursor))));
      const { node } = findParentNode(node => node.type === schema.nodes.table)(
        selection
      );
      expect(node.type.name).toEqual('table');
    });
    it('should return `undefined` if parent node has not been found', () => {
      const {
        state: { schema, selection }
      } = createEditor(doc(table(tr(tdCursor))));
      const result = findParentNode(
        node => node.type === schema.nodes.table_header
      )(selection);
      expect(result).toBeUndefined();
    });
  });

  describe('findParentNodeClosestToPos', () => {
    it('should find parent node if a given `$pos` is directly inside it', () => {
      const { state } = createEditor(doc(p('hello')));
      const { paragraph } = state.schema.nodes;
      const { node } = findParentNodeClosestToPos(
        state.doc.resolve(2),
        node => node.type === paragraph
      );
      expect(node.type.name).toEqual('paragraph');
    });
    it('should find parent node if a given `$pos` is inside nested child', () => {
      const { state } = createEditor(doc(table(tr(tdEmpty))));
      const { nodes } = state.schema;
      const { node } = findParentNodeClosestToPos(
        state.doc.resolve(4),
        node => node.type === nodes.table
      );
      expect(node.type.name).toEqual('table');
    });
    it('should return `undefined` if a parent node has not been found', () => {
      const { state } = createEditor(doc(table(tr(tdEmpty))));
      const { table_header } = state.schema.nodes;
      const result = findParentNodeClosestToPos(
        state.doc.resolve(4),
        node => node.type === table_header
      );
      expect(result).toBeUndefined();
    });
  });

  describe('findParentDomRef', () => {
    it('should find DOM ref of the parent node if cursor is directly inside it', () => {
      const {
        state: { schema, selection },
        view
      } = createEditor(doc(p('hello <cursor>')));
      const domAtPos = view.domAtPos.bind(view);
      const ref = findParentDomRef(
        node => node.type === schema.nodes.paragraph,
        domAtPos
      )(selection);
      expect(ref instanceof HTMLParagraphElement).toBe(true);
    });
    it('should find DOM ref of the parent node if cursor is inside nested child', () => {
      const {
        state: { schema, selection },
        view
      } = createEditor(doc(table(tr(tdCursor))));
      const domAtPos = view.domAtPos.bind(view);
      const ref = findParentDomRef(
        node => node.type === schema.nodes.table_cell,
        domAtPos
      )(selection);
      expect(ref instanceof HTMLTableCellElement).toBe(true);
    });
    it('should return `undefined` if parent node has not been found', () => {
      const {
        state: { schema, selection },
        view
      } = createEditor(doc(table(tr(tdCursor))));
      const domAtPos = view.domAtPos.bind(view);
      const ref = findParentDomRef(
        node => node.type === schema.nodes.table_header,
        domAtPos
      )(selection);
      expect(ref).toBeUndefined();
    });
  });

  describe('hasParentNode', () => {
    it('should return `true` if parent node has been found', () => {
      const {
        state: { schema, selection }
      } = createEditor(doc(p('hello <cursor>')));
      const result = hasParentNode(
        node => node.type === schema.nodes.paragraph
      )(selection);
      expect(result).toBe(true);
    });
    it('should return `false` if parent node has not been found', () => {
      const {
        state: { schema, selection }
      } = createEditor(doc(p('hello <cursor>')));
      const result = hasParentNode(node => node.type === schema.nodes.table)(
        selection
      );
      expect(result).toBe(false);
    });
  });

  describe('findParentNodeOfType', () => {
    it('should find parent node of a given `nodeType` if cursor is directly inside it', () => {
      const {
        state: { schema, selection }
      } = createEditor(doc(p('hello <cursor>')));
      const { node } = findParentNodeOfType(schema.nodes.paragraph)(selection);
      expect(node.type.name).toEqual('paragraph');
    });
    it('should return `undefined` if parent node of a given `nodeType` has not been found', () => {
      const {
        state: { schema, selection }
      } = createEditor(doc(p('hello <cursor>')));
      const result = findParentNodeOfType(schema.nodes.table)(selection);
      expect(result).toBeUndefined();
    });
    it('should find parent node of a given `nodeType`, if `nodeType` is an array', () => {
      const {
        state: {
          schema: {
            nodes: { paragraph, blockquote, table }
          },
          selection
        }
      } = createEditor(doc(p('hello <cursor>')));
      const { node } = findParentNodeOfType([table, blockquote, paragraph])(
        selection
      );
      expect(node.type.name).toEqual('paragraph');
    });
  });

  describe('findParentNodeOfTypeClosestToPos', () => {
    it('should find parent node of a given `nodeType` if a given `$pos` is directly inside it', () => {
      const { state } = createEditor(doc(p('hello')));
      const { paragraph } = state.schema.nodes;
      const { node } = findParentNodeOfTypeClosestToPos(
        state.doc.resolve(2),
        paragraph
      );
      expect(node.type.name).toEqual('paragraph');
    });
    it('should return `undefined` if parent node of a given `nodeType` has not been found at a given `$pos`', () => {
      const { state } = createEditor(doc(p('hello')));
      const { table } = state.schema;
      const result = findParentNodeOfTypeClosestToPos(
        state.doc.resolve(2),
        table
      );
      expect(result).toBeUndefined();
    });
    it('should find parent node of a given `nodeType` at a given `$pos`, if `nodeType` is an array', () => {
      const { state } = createEditor(doc(p('hello')));
      const { table, blockquote, paragraph } = state.schema.nodes;
      const { node } = findParentNodeOfTypeClosestToPos(state.doc.resolve(2), [
        table,
        blockquote,
        paragraph
      ]);
      expect(node.type.name).toEqual('paragraph');
    });
  });

  describe('hasParentNodeOfType', () => {
    it('should return `true` if parent node of a given `nodeType` has been found', () => {
      const {
        state: { schema, selection }
      } = createEditor(doc(p('hello <cursor>')));
      const result = hasParentNodeOfType(schema.nodes.paragraph)(selection);
      expect(result).toBe(true);
    });
    it('should return `false` if parent node of a given `nodeType` has not been found', () => {
      const {
        state: { schema, selection }
      } = createEditor(doc(p('hello <cursor>')));
      const result = hasParentNodeOfType(schema.nodes.table)(selection);
      expect(result).toBe(false);
    });
  });

  describe('findParentDomRefOfType', () => {
    it('should find DOM ref of the parent node of a given `nodeType` if cursor is directly inside it', () => {
      const {
        state: { schema, selection },
        view
      } = createEditor(doc(p('hello <cursor>')));
      const domAtPos = view.domAtPos.bind(view);
      const ref = findParentDomRefOfType(schema.nodes.paragraph, domAtPos)(
        selection
      );
      expect(ref instanceof HTMLParagraphElement).toBe(true);
    });
    it('should return `undefined` if parent node of a given `nodeType` has not been found', () => {
      const {
        state: { schema, selection },
        view
      } = createEditor(doc(p('hello <cursor>')));
      const domAtPos = view.domAtPos.bind(view);
      const ref = findParentDomRefOfType(schema.nodes.table, domAtPos)(
        selection
      );
      expect(ref).toBeUndefined();
    });
  });

  describe('findSelectedNodeOfType', () => {
    it('should return `undefined` if selection is not a NodeSelection', () => {
      const {
        state: { schema, selection }
      } = createEditor(doc(p('<cursor>')));
      const node = findSelectedNodeOfType(schema.nodes.paragraph)(selection);
      expect(node).toBeUndefined();
    });
    it('should return selected node of a given `nodeType`', () => {
      const { state } = createEditor(doc(p('<cursor>one')));
      const tr = state.tr.setSelection(NodeSelection.create(state.doc, 0));
      const selectedNode = findSelectedNodeOfType(state.schema.nodes.paragraph)(
        tr.selection
      );
      expect(selectedNode.node.type.name).toEqual('paragraph');
    });
    it('should return selected node of one of the given `nodeType`s', () => {
      const { state } = createEditor(doc(p('<cursor>one')));
      const { paragraph, table } = state.schema.nodes;
      const tr = state.tr.setSelection(NodeSelection.create(state.doc, 0));
      const selectedNode = findSelectedNodeOfType([paragraph, table])(
        tr.selection
      );
      expect(selectedNode.node.type.name).toEqual('paragraph');
    });
  });

  describe('findPositionOfNodeBefore', () => {
    it('should return `undefined` if there is no nodeBefore', () => {
      const {
        state: { selection }
      } = createEditor(doc(p('<cursor>')));
      const result = findPositionOfNodeBefore(selection);
      expect(result).toBeUndefined();
    });
    it('should return position of nodeBefore if its a table', () => {
      const {
        state: { selection }
      } = createEditor(
        doc(p('text'), table(tr(tdEmpty), tr(tdEmpty)), '<cursor>')
      );
      const position = findPositionOfNodeBefore(selection);
      expect(position).toEqual(6);
    });
    it('should return position of nodeBefore if its a blockquote', () => {
      const {
        state: { selection }
      } = createEditor(doc(p('text'), blockquote(p('')), '<cursor>'));
      const position = findPositionOfNodeBefore(selection);
      expect(position).toEqual(6);
    });
    it('should return position of nodeBefore if its a nested leaf node', () => {
      const {
        state: { selection }
      } = createEditor(
        doc(p('text'), table(tr(td(p('1'), atomBlock(), '<cursor>'))))
      );
      const position = findPositionOfNodeBefore(selection);
      expect(position).toEqual(12);
    });
    it('should return position of nodeBefore if its a leaf node', () => {
      const {
        state: { selection }
      } = createEditor(doc(p('text'), atomBlock(), '<cursor>'));
      const position = findPositionOfNodeBefore(selection);
      expect(position).toEqual(6);
    });
    it('should return position of nodeBefore if its a leaf node with nested inline atom node', () => {
      const {
        state: { selection }
      } = createEditor(doc(p('text'), atomContainer(atomBlock()), '<cursor>'));
      const position = findPositionOfNodeBefore(selection);
      expect(position).toEqual(6);
    });
  });

  describe('findDomRefAtPos', () => {
    it('should return DOM reference of a top level block leaf node', () => {
      const { view } = createEditor(doc(p('text'), atomBlock()));
      const ref = findDomRefAtPos(6, view.domAtPos.bind(view));
      expect(ref instanceof HTMLDivElement).toBe(true);
      expect(ref.getAttribute('data-node-type')).toEqual('atomBlock');
    });

    it('should return DOM reference of a nested inline leaf node', () => {
      const { view } = createEditor(doc(p('one', atomInline(), 'two')));
      const ref = findDomRefAtPos(4, view.domAtPos.bind(view));
      expect(ref instanceof HTMLSpanElement).toBe(true);
      expect(ref.getAttribute('data-node-type')).toEqual('atomInline');
    });

    it('should return DOM reference of a content block node', () => {
      const { view } = createEditor(doc(p('one'), blockquote(p('two'))));
      const ref = findDomRefAtPos(5, view.domAtPos.bind(view));
      expect(ref instanceof HTMLQuoteElement).toBe(true);
    });

    it('should return DOM reference of a text node when offset=0', () => {
      const { view } = createEditor(doc(p('text')));
      const ref = findDomRefAtPos(1, view.domAtPos.bind(view));
      expect(ref instanceof Text).toBe(true);
    });

    it('should return DOM reference of a text node when offset>0', () => {
      const { view } = createEditor(doc(p(atomInline(), 'text')));
      const ref = findDomRefAtPos(3, view.domAtPos.bind(view));
      expect(ref instanceof Text).toBe(true);
    });

    it('should return DOM reference of a block node that follows a widget decoration', () => {
      const { view } = createEditor(doc(blockquote(p('text')), p('text')));
      // prepend a fake decoration node
      const deco = document.createElement('div');
      deco.className = 'fake-decoration ProseMirror-widget';
      view.dom.insertBefore(deco, view.dom.firstChild);

      const ref = findDomRefAtPos(0, view.domAtPos.bind(view));
      expect(ref instanceof HTMLQuoteElement).toBe(true);
    });
    it('should return DOM reference of a block node when there is a widget decoration before and after', () => {
      const { view } = createEditor(
        doc(p('text'), blockquote(p('text text')), atomBlock(), p('text text'))
      );
      // insert fake decoration before the first paragraph
      const deco1 = document.createElement('div');
      deco1.className = 'fake-decoration1 ProseMirror-widget';
      view.dom.insertBefore(deco1, view.dom.firstChild);

      // insert fake decoration before blockquote
      const deco2 = document.createElement('div');
      deco2.className = 'fake-decoration2 ProseMirror-widget';
      view.dom.insertBefore(deco2, view.dom.childNodes[1]);

      // append another fake decoration at the end of the content area
      const deco3 = document.createElement('div');
      deco3.className = 'fake-decoration3 ProseMirror-widget';
      view.dom.appendChild(deco3);

      const ref = findDomRefAtPos(6, view.domAtPos.bind(view));
      expect(ref instanceof HTMLQuoteElement).toBe(true);
    });
  });
});
