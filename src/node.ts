import { type Node as PMNode, MarkType, NodeType } from 'prosemirror-model';
import type { Attrs } from './types';

type FindChildrenAttrsPredicate = (attrs: Attrs) => boolean;
type FindNodesResult = Array<{ node: PMNode; pos: number }>;
type FindChildrenPredicate = (node: PMNode) => boolean;

// Flattens descendants of a given `node`. It doesn't descend into a node when descend argument is `false` (defaults to `true`).
//
// ```javascript
// const children = flatten(node);
// ```
export const flatten = (
  node: PMNode,
  descend: boolean = true
): FindNodesResult => {
  if (!node) {
    throw new Error('Invalid "node" parameter');
  }
  const result: FindNodesResult = [];
  node.descendants((child, pos) => {
    result.push({ node: child, pos });
    if (!descend) {
      return false;
    }
  });
  return result;
};

// Iterates over descendants of a given `node`, returning child nodes predicate returns truthy for. It doesn't descend into a node when descend argument is `false` (defaults to `true`).
//
// ```javascript
// const textNodes = findChildren(node, child => child.isText, false);
// ```
export const findChildren = (
  node: PMNode,
  predicate: FindChildrenPredicate,
  descend: boolean = true
): FindNodesResult => {
  if (!node) {
    throw new Error('Invalid "node" parameter');
  } else if (!predicate) {
    throw new Error('Invalid "predicate" parameter');
  }
  return flatten(node, descend).filter((child) => predicate(child.node));
};

// Returns text nodes of a given `node`. It doesn't descend into a node when descend argument is `false` (defaults to `true`).
//
// ```javascript
// const textNodes = findTextNodes(node);
// ```
export const findTextNodes = (
  node: PMNode,
  descend: boolean = true
): FindNodesResult => {
  return findChildren(node, (child) => child.isText, descend);
};

// Returns inline nodes of a given `node`. It doesn't descend into a node when descend argument is `false` (defaults to `true`).
//
// ```javascript
// const inlineNodes = findInlineNodes(node);
// ```
export const findInlineNodes = (
  node: PMNode,
  descend: boolean = true
): FindNodesResult => {
  return findChildren(node, (child) => child.isInline, descend);
};

// Returns block descendants of a given `node`. It doesn't descend into a node when descend argument is `false` (defaults to `true`).
//
// ```javascript
// const blockNodes = findBlockNodes(node);
// ```
export const findBlockNodes = (
  node: PMNode,
  descend: boolean = true
): FindNodesResult => {
  return findChildren(node, (child) => child.isBlock, descend);
};

// Iterates over descendants of a given `node`, returning child nodes predicate returns truthy for. It doesn't descend into a node when descend argument is `false` (defaults to `true`).
//
// ```javascript
// const mergedCells = findChildrenByAttr(table, attrs => attrs.colspan === 2);
// ```
export const findChildrenByAttr = (
  node: PMNode,
  predicate: FindChildrenAttrsPredicate,
  descend: boolean = true
): FindNodesResult => {
  return findChildren(node, (child) => !!predicate(child.attrs), descend);
};

// Iterates over descendants of a given `node`, returning child nodes of a given nodeType. It doesn't descend into a node when descend argument is `false` (defaults to `true`).
//
// ```javascript
// const cells = findChildrenByType(table, schema.nodes.tableCell);
// ```
export const findChildrenByType = (
  node: PMNode,
  nodeType: NodeType,
  descend: boolean = true
): FindNodesResult => {
  return findChildren(node, (child) => child.type === nodeType, descend);
};

// Iterates over descendants of a given `node`, returning child nodes that have a mark of a given markType. It doesn't descend into a `node` when descend argument is `false` (defaults to `true`).
//
// ```javascript
// const nodes = findChildrenByMark(state.doc, schema.marks.strong);
// ```
export const findChildrenByMark = (
  node: PMNode,
  markType: MarkType,
  descend: boolean = true
): FindNodesResult => {
  return findChildren(
    node,
    (child) => Boolean(markType.isInSet(child.marks)),
    descend
  );
};

// Returns `true` if a given node contains nodes of a given `nodeType`
//
// ```javascript
// if (contains(panel, schema.nodes.listItem)) {
//   // ...
// }
// ```
export const contains = (node: PMNode, nodeType: NodeType): boolean => {
  return !!findChildrenByType(node, nodeType).length;
};
