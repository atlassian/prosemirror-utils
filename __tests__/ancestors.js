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
      const { state: { schema, selection } } = createEditor(doc(p('hello <cursor>')));
      const { node } = findParentNode(node => node.type === schema.nodes.paragraph)(selection);
      expect(node.type.name).toEqual('paragraph');
    });
    it('should find parent node if cursor is inside nested child', () => {
      const { state: { schema, selection } } = createEditor(doc(table(tr(tdCursor))));
      const { node } = findParentNode(node => node.type === schema.nodes.table)(selection);
      expect(node.type.name).toEqual('table');
    });
    it('should return `undefined` if parent node has not been found', () => {
      const { state: { schema, selection } } = createEditor(doc(table(tr(tdCursor))));
      const result = findParentNode(node => node.type === schema.nodes.table_header)(selection);
      expect(result).toBeUndefined();
    });
  });

  describe('findParentDomRef', () => {
    it('should find DOM ref of the parent node if cursor is directly inside it', () => {
      const { state: { schema, selection }, view } = createEditor(doc(p('hello <cursor>')));
      const domAtPos = view.domAtPos.bind(view);
      const ref = findParentDomRef(node => node.type === schema.nodes.paragraph, domAtPos)(selection);
      expect(ref).toBeDefined();
    });
    it('should find DOM ref of the parent node if cursor is inside nested child', () => {
      const { state: { schema, selection }, view } = createEditor(doc(table(tr(tdCursor))));
      const domAtPos = view.domAtPos.bind(view);
      const ref = findParentDomRef(node => node.type === schema.nodes.table, domAtPos)(selection);
      expect(ref).toBeDefined();
    });
    it('should return `undefined` if parent node has not been found', () => {
      const { state: { schema, selection }, view } = createEditor(doc(table(tr(tdCursor))));
      const domAtPos = view.domAtPos.bind(view);
      const ref = findParentDomRef(node => node.type === schema.nodes.table_header, domAtPos)(selection);
      expect(ref).toBeUndefined();
    });
  });

  describe('hasParentNode', () => {
    it('should return `true` if parent node has been found', () => {
      const { state: { schema, selection } } = createEditor(doc(p('hello <cursor>')));
      const result = hasParentNode(node => node.type === schema.nodes.paragraph)(selection);
      expect(result).toBe(true);
    });
    it('should return `false` if parent node has not been found', () => {
      const { state: { schema, selection } } = createEditor(doc(p('hello <cursor>')));
      const result = hasParentNode(node => node.type === schema.nodes.table)(selection);
      expect(result).toBe(false);
    });
  });

  describe('findParentNodeOfType', () => {
    it('should find parent node of a given `nodeType` if cursor is directly inside it', () => {
      const { state: { schema, selection } } = createEditor(doc(p('hello <cursor>')));
      const { node } = findParentNodeOfType(schema.nodes.paragraph)(selection);
      expect(node.type.name).toEqual('paragraph');
    });
    it('should return `undefined` if parent node of a given `nodeType` has not been found', () => {
      const { state: { schema, selection } } = createEditor(doc(p('hello <cursor>')));
      const result = findParentNodeOfType(schema.nodes.table)(selection);
      expect(result).toBeUndefined();
    });
  });

  describe('hasParentNodeOfType', () => {
    it('should return `true` if parent node of a given `nodeType` has been found', () => {
      const { state: { schema, selection } } = createEditor(doc(p('hello <cursor>')));
      const result = hasParentNodeOfType(schema.nodes.paragraph)(selection);
      expect(result).toBe(true);
    });
    it('should return `false` if parent node of a given `nodeType` has not been found', () => {
      const { state: { schema, selection } } = createEditor(doc(p('hello <cursor>')));
      const result = hasParentNodeOfType(schema.nodes.table)(selection);
      expect(result).toBe(false);
    });
  });

  describe('findParentDomRefOfType', () => {
    it('should find DOM ref of the parent node of a given `nodeType` if cursor is directly inside it', () => {
      const { state: { schema, selection }, view } = createEditor(doc(p('hello <cursor>')));
      const domAtPos = view.domAtPos.bind(view);
      const ref = findParentDomRefOfType(schema.nodes.paragraph, domAtPos)(selection);
      expect(ref).toBeDefined();
    });
    it('should return `undefined` if parent node of a given `nodeType` has not been found', () => {
      const { state: { schema, selection }, view } = createEditor(doc(p('hello <cursor>')));
      const domAtPos = view.domAtPos.bind(view);
      const ref = findParentDomRefOfType(schema.nodes.table, domAtPos)(selection);
      expect(ref).toBeUndefined();
    });
  });
});
