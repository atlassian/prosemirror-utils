import type { Node as PMNode, ResolvedPos } from 'prosemirror-model';
import { Selection } from 'prosemirror-state';
import type {
  FindPredicate,
  FindResult,
  DomAtPos,
  NodeTypeParam,
} from './types';
import { equalNodeType, isNodeSelection } from './helpers';

// Iterates over parent nodes, returning the closest node and its start position `predicate` returns truthy for. `start` points to the start position of the node, `pos` points directly before the node.
//
// ```javascript
// const predicate = node => node.type === schema.nodes.blockquote;
// const parent = findParentNode(predicate)(selection);
// ```
export const findParentNode2 =
  (predicate: FindPredicate) =>
  ({ $from }: Selection): FindResult =>
    findParentNodeClosestToPos($from, predicate);

export const findParentNode =
  (predicate: FindPredicate) =>
  ({ $from, $to }: Selection): FindResult => {
    // Check if parent are different
    if (!$from.sameParent($to)) {
      // If they are, I need to find a common parent
      let depth = Math.min($from.depth, $to.depth);
      while (depth >= 0) {
        const fromNode = $from.node(depth);
        const toNode = $to.node(depth);
        if (toNode === fromNode) {
          // The have the same parent
          if (predicate(fromNode)) {
            // Check the predicate
            return {
              // Return the resolved pos
              pos: depth > 0 ? $from.before(depth) : 0,
              start: $from.start(depth),
              depth: depth,
              node: fromNode,
            };
          }
        }
        depth = depth - 1; // Keep looking
      }
      return;
    }

    return findParentNodeClosestToPos($from, predicate);
  };

// Iterates over parent nodes starting from the given `$pos`, returning the closest node and its start position `predicate` returns truthy for. `start` points to the start position of the node, `pos` points directly before the node.
//
// ```javascript
// const predicate = node => node.type === schema.nodes.blockquote;
// const parent = findParentNodeClosestToPos(state.doc.resolve(5), predicate);
// ```
export const findParentNodeClosestToPos = (
  $pos: ResolvedPos,
  predicate: FindPredicate
): FindResult => {
  for (let i = $pos.depth; i > 0; i--) {
    const node = $pos.node(i);
    if (predicate(node)) {
      return {
        pos: i > 0 ? $pos.before(i) : 0,
        start: $pos.start(i),
        depth: i,
        node,
      };
    }
  }
};

// Iterates over parent nodes, returning DOM reference of the closest node `predicate` returns truthy for.
//
// ```javascript
// const domAtPos = view.domAtPos.bind(view);
// const predicate = node => node.type === schema.nodes.table;
// const parent = findParentDomRef(predicate, domAtPos)(selection); // <table>
// ```
export const findParentDomRef =
  (predicate: FindPredicate, domAtPos: DomAtPos) =>
  (selection: Selection): Node | undefined => {
    const parent = findParentNode(predicate)(selection);
    if (parent) {
      return findDomRefAtPos(parent.pos, domAtPos);
    }
  };

// Checks if there's a parent node `predicate` returns truthy for.
//
// ```javascript
// if (hasParentNode(node => node.type === schema.nodes.table)(selection)) {
//   // ....
// }
// ```
export const hasParentNode =
  (predicate: FindPredicate) =>
  (selection: Selection): boolean => {
    return !!findParentNode(predicate)(selection);
  };

// Iterates over parent nodes, returning closest node of a given `nodeType`. `start` points to the start position of the node, `pos` points directly before the node.
//
// ```javascript
// const parent = findParentNodeOfType(schema.nodes.paragraph)(selection);
// ```
export const findParentNodeOfType =
  (nodeType: NodeTypeParam) =>
  (selection: Selection): FindResult => {
    return findParentNode((node) => equalNodeType(nodeType, node))(selection);
  };

// Iterates over parent nodes starting from the given `$pos`, returning closest node of a given `nodeType`. `start` points to the start position of the node, `pos` points directly before the node.
//
// ```javascript
// const parent = findParentNodeOfTypeClosestToPos(state.doc.resolve(10), schema.nodes.paragraph);
// ```
export const findParentNodeOfTypeClosestToPos = (
  $pos: ResolvedPos,
  nodeType: NodeTypeParam
): FindResult => {
  return findParentNodeClosestToPos($pos, (node: PMNode) =>
    equalNodeType(nodeType, node)
  );
};

// Checks if there's a parent node of a given `nodeType`.
//
// ```javascript
// if (hasParentNodeOfType(schema.nodes.table)(selection)) {
//   // ....
// }
// ```
export const hasParentNodeOfType =
  (nodeType: NodeTypeParam) =>
  (selection: Selection): boolean => {
    return hasParentNode((node) => equalNodeType(nodeType, node))(selection);
  };

// Iterates over parent nodes, returning DOM reference of the closest node of a given `nodeType`.
//
// ```javascript
// const domAtPos = view.domAtPos.bind(view);
// const parent = findParentDomRefOfType(schema.nodes.codeBlock, domAtPos)(selection); // <pre>
// ```
export const findParentDomRefOfType =
  (nodeType: NodeTypeParam, domAtPos: DomAtPos) =>
  (selection: Selection): Node | undefined => {
    return findParentDomRef(
      (node) => equalNodeType(nodeType, node),
      domAtPos
    )(selection);
  };

// Returns a node of a given `nodeType` if it is selected. `start` points to the start position of the node, `pos` points directly before the node.
//
// ```javascript
// const { extension, inlineExtension, bodiedExtension } = schema.nodes;
// const selectedNode = findSelectedNodeOfType([
//   extension,
//   inlineExtension,
//   bodiedExtension,
// ])(selection);
// ```
export const findSelectedNodeOfType =
  (nodeType: NodeTypeParam) =>
  (selection: Selection): FindResult => {
    if (isNodeSelection(selection)) {
      const { node, $from } = selection;
      if (equalNodeType(nodeType, node)) {
        return {
          node,
          start: $from.start(),
          pos: $from.pos,
          depth: $from.depth,
        };
      }
    }
  };

// Returns position of the previous node.
//
// ```javascript
// const pos = findPositionOfNodeBefore(tr.selection);
// ```
export const findPositionOfNodeBefore = (
  selection: Selection
): number | undefined => {
  const { nodeBefore } = selection.$from;
  const maybeSelection = Selection.findFrom(selection.$from, -1);
  if (maybeSelection && nodeBefore) {
    // leaf node
    const parent = findParentNodeOfType(nodeBefore.type)(maybeSelection);
    if (parent) {
      return parent.pos;
    }
    return maybeSelection.$from.pos;
  }
};

// Returns DOM reference of a node at a given `position`. If the node type is of type `TEXT_NODE` it will return the reference of the parent node.
//
// ```javascript
// const domAtPos = view.domAtPos.bind(view);
// const ref = findDomRefAtPos($from.pos, domAtPos);
// ```
export const findDomRefAtPos = (position: number, domAtPos: DomAtPos): Node => {
  const dom = domAtPos(position);
  const node = dom.node.childNodes[dom.offset];

  if (dom.node.nodeType === Node.TEXT_NODE && dom.node.parentNode) {
    return dom.node.parentNode;
  }

  if (!node || node.nodeType === Node.TEXT_NODE) {
    return dom.node;
  }

  return node;
};
