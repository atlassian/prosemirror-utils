import { NodeSelection } from 'prosemirror-state';
import {
  createEditor,
  doc,
  p,
  table,
  tr,
  th,
  tdCursor,
  tdEmpty,
  blockquote,
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
  findPositionOfNodeBefore
} from '../src';

describe('selection', () => {
  describe('findParentNode', () => {
    it('should find parent node if cursor is directly inside it', () => {
      const { state: { schema, selection } } = createEditor(
        doc(p('hello <cursor>'))
      );
      const { node } = findParentNode(
        node => node.type === schema.nodes.paragraph
      )(selection);
      expect(node.type.name).toEqual('paragraph');
    });
    it('should find parent node if cursor is inside nested child', () => {
      const { state: { schema, selection } } = createEditor(
        doc(table(tr(tdCursor)))
      );
      const { node } = findParentNode(node => node.type === schema.nodes.table)(
        selection
      );
      expect(node.type.name).toEqual('table');
    });
    it('should return `undefined` if parent node has not been found', () => {
      const { state: { schema, selection } } = createEditor(
        doc(table(tr(tdCursor)))
      );
      const result = findParentNode(
        node => node.type === schema.nodes.table_header
      )(selection);
      expect(result).toBeUndefined();
    });
  });

  describe('findParentDomRef', () => {
    it('should find DOM ref of the parent node if cursor is directly inside it', () => {
      const { state: { schema, selection }, view } = createEditor(
        doc(p('hello <cursor>'))
      );
      const domAtPos = view.domAtPos.bind(view);
      const ref = findParentDomRef(
        node => node.type === schema.nodes.paragraph,
        domAtPos
      )(selection);
      expect(ref).toBeDefined();
    });
    it('should find DOM ref of the parent node if cursor is inside nested child', () => {
      const { state: { schema, selection }, view } = createEditor(
        doc(table(tr(tdCursor)))
      );
      const domAtPos = view.domAtPos.bind(view);
      const ref = findParentDomRef(
        node => node.type === schema.nodes.table,
        domAtPos
      )(selection);
      expect(ref).toBeDefined();
    });
    it('should return `undefined` if parent node has not been found', () => {
      const { state: { schema, selection }, view } = createEditor(
        doc(table(tr(tdCursor)))
      );
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
      const { state: { schema, selection } } = createEditor(
        doc(p('hello <cursor>'))
      );
      const result = hasParentNode(
        node => node.type === schema.nodes.paragraph
      )(selection);
      expect(result).toBe(true);
    });
    it('should return `false` if parent node has not been found', () => {
      const { state: { schema, selection } } = createEditor(
        doc(p('hello <cursor>'))
      );
      const result = hasParentNode(node => node.type === schema.nodes.table)(
        selection
      );
      expect(result).toBe(false);
    });
  });

  describe('findParentNodeOfType', () => {
    it('should find parent node of a given `nodeType` if cursor is directly inside it', () => {
      const { state: { schema, selection } } = createEditor(
        doc(p('hello <cursor>'))
      );
      const { node } = findParentNodeOfType(schema.nodes.paragraph)(selection);
      expect(node.type.name).toEqual('paragraph');
    });
    it('should return `undefined` if parent node of a given `nodeType` has not been found', () => {
      const { state: { schema, selection } } = createEditor(
        doc(p('hello <cursor>'))
      );
      const result = findParentNodeOfType(schema.nodes.table)(selection);
      expect(result).toBeUndefined();
    });
    it('should find parent node of a given `nodeType`, if `nodeType` is an array', () => {
      const {
        state: {
          schema: { nodes: { paragraph, blockquote, table } },
          selection
        }
      } = createEditor(doc(p('hello <cursor>')));
      const { node } = findParentNodeOfType([table, blockquote, paragraph])(
        selection
      );
      expect(node.type.name).toEqual('paragraph');
    });
  });

  describe('hasParentNodeOfType', () => {
    it('should return `true` if parent node of a given `nodeType` has been found', () => {
      const { state: { schema, selection } } = createEditor(
        doc(p('hello <cursor>'))
      );
      const result = hasParentNodeOfType(schema.nodes.paragraph)(selection);
      expect(result).toBe(true);
    });
    it('should return `false` if parent node of a given `nodeType` has not been found', () => {
      const { state: { schema, selection } } = createEditor(
        doc(p('hello <cursor>'))
      );
      const result = hasParentNodeOfType(schema.nodes.table)(selection);
      expect(result).toBe(false);
    });
  });

  describe('findParentDomRefOfType', () => {
    it('should find DOM ref of the parent node of a given `nodeType` if cursor is directly inside it', () => {
      const { state: { schema, selection }, view } = createEditor(
        doc(p('hello <cursor>'))
      );
      const domAtPos = view.domAtPos.bind(view);
      const ref = findParentDomRefOfType(schema.nodes.paragraph, domAtPos)(
        selection
      );
      expect(ref).toBeDefined();
    });
    it('should return `undefined` if parent node of a given `nodeType` has not been found', () => {
      const { state: { schema, selection }, view } = createEditor(
        doc(p('hello <cursor>'))
      );
      const domAtPos = view.domAtPos.bind(view);
      const ref = findParentDomRefOfType(schema.nodes.table, domAtPos)(
        selection
      );
      expect(ref).toBeUndefined();
    });
  });

  describe('findSelectedNodeOfType', () => {
    it('should return `undefined` if selection is not a NodeSelection', () => {
      const { state: { schema, selection } } = createEditor(doc(p('<cursor>')));
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
      const { state: { selection } } = createEditor(doc(p('<cursor>')));
      const result = findPositionOfNodeBefore(selection);
      expect(result).toBeUndefined();
    });
    it('should return position of nodeBefore if its a table', () => {
      const { state: { selection } } = createEditor(
        doc(p('text'), table(tr(tdEmpty), tr(tdEmpty)), '<cursor>')
      );
      const position = findPositionOfNodeBefore(selection);
      expect(position).toEqual(7);
    });
    it('should return position of nodeBefore if its a blockquote', () => {
      const { state: { selection } } = createEditor(
        doc(p('text'), blockquote(p('')), '<cursor>')
      );
      const position = findPositionOfNodeBefore(selection);
      expect(position).toEqual(7);
    });
    it('should return position of nodeBefore if its a leaf node', () => {
      const { state: { selection } } = createEditor(
        doc(p('text'), atomBlock(), '<cursor>')
      );
      const position = findPositionOfNodeBefore(selection);
      expect(position).toEqual(6);
    });
  });
});
