import { createEditor, doc, p, table, tr, th, tdCursor } from '../test-helpers';
import {
  findParentNode,
  findParentDomRef,
  hasParentNode,
  findParentNodeOfType,
  hasParentNodeOfType,
  findParentDomRefOfType
} from '../src';

describe('ancestors', () => {
  describe('findParentNode', () => {
    it('should find parent node if cursor is directly inside it', () => {
      const { state } = createEditor(doc(p('hello <cursor>')));
      const { node } = findParentNode(node => node.type === state.schema.nodes.paragraph)(state);
      expect(node.type.name).toEqual('paragraph');
    });
    it('should find parent node if cursor is inside nested child', () => {
      const { state } = createEditor(doc(table(tr(tdCursor))));
      const { node } = findParentNode(node => node.type === state.schema.nodes.table)(state);
      expect(node.type.name).toEqual('table');
    });
    it('should return `undefined` if parent node has not been found', () => {
      const { state } = createEditor(doc(table(tr(tdCursor))));
      const result = findParentNode(node => node.type === state.schema.nodes.table_header)(state);
      expect(result).toBeUndefined();
    });
  });

  describe('findParentDomRef', () => {
    it('should find DOM ref of the parent node if cursor is directly inside it', () => {
      const { state, view } = createEditor(doc(p('hello <cursor>')));
      const domAtPos = view.domAtPos.bind(view);
      const ref = findParentDomRef(node => node.type === state.schema.nodes.paragraph, domAtPos)(state);
      expect(ref).toBeDefined();
    });
    it('should find DOM ref of the parent node if cursor is inside nested child', () => {
      const { state, view } = createEditor(doc(table(tr(tdCursor))));
      const domAtPos = view.domAtPos.bind(view);
      const ref = findParentDomRef(node => node.type === state.schema.nodes.table, domAtPos)(state);
      expect(ref).toBeDefined();
    });
    it('should return `undefined` if parent node has not been found', () => {
      const { state, view } = createEditor(doc(table(tr(tdCursor))));
      const domAtPos = view.domAtPos.bind(view);
      const ref = findParentDomRef(node => node.type === state.schema.nodes.table_header, domAtPos)(state);
      expect(ref).toBeUndefined();
    });
  });

  describe('hasParentNode', () => {
    it('should return `true` if parent node has been found', () => {
      const { state } = createEditor(doc(p('hello <cursor>')));
      const result = hasParentNode(node => node.type === state.schema.nodes.paragraph)(state);
      expect(result).toBe(true);
    });
    it('should return `false` if parent node has not been found', () => {
      const { state } = createEditor(doc(p('hello <cursor>')));
      const result = hasParentNode(node => node.type === state.schema.nodes.table)(state);
      expect(result).toBe(false);
    });
  });

  describe('findParentNodeOfType', () => {
    it('should find parent node of a given `nodeType` if cursor is directly inside it', () => {
      const { state } = createEditor(doc(p('hello <cursor>')));
      const { node } = findParentNodeOfType(state.schema.nodes.paragraph)(state);
      expect(node.type.name).toEqual('paragraph');
    });
    it('should return `undefined` if parent node of a given `nodeType` has not been found', () => {
      const { state } = createEditor(doc(p('hello <cursor>')));
      const result = findParentNodeOfType(state.schema.nodes.table)(state);
      expect(result).toBeUndefined();
    });
  });

  describe('hasParentNodeOfType', () => {
    it('should return `true` if parent node of a given `nodeType` has been found', () => {
      const { state } = createEditor(doc(p('hello <cursor>')));
      const result = hasParentNodeOfType(state.schema.nodes.paragraph)(state);
      expect(result).toBe(true);
    });
    it('should return `false` if parent node of a given `nodeType` has not been found', () => {
      const { state } = createEditor(doc(p('hello <cursor>')));
      const result = hasParentNodeOfType(state.schema.nodes.table)(state);
      expect(result).toBe(false);
    });
  });

  describe('findParentDomRefOfType', () => {
    it('should find DOM ref of the parent node of a given `nodeType` if cursor is directly inside it', () => {
      const { state, view } = createEditor(doc(p('hello <cursor>')));
      const domAtPos = view.domAtPos.bind(view);
      const ref = findParentDomRefOfType(state.schema.nodes.paragraph, domAtPos)(state);
      expect(ref).toBeDefined();
    });
    it('should return `undefined` if parent node of a given `nodeType` has not been found', () => {
      const { state, view } = createEditor(doc(p('hello <cursor>')));
      const domAtPos = view.domAtPos.bind(view);
      const ref = findParentDomRefOfType(state.schema.nodes.table, domAtPos)(state);
      expect(ref).toBeUndefined();
    });
  });
});
