import { Selection } from 'prosemirror-state';
import { equalNodeType, isNodeSelection } from './helpers';

// :: (predicate: (node: ProseMirrorNode) → boolean) → (selection: Selection) → ?{pos: number, node: ProseMirrorNode}
// Iterates over parent nodes, returning the closest node and its start position `predicate` returns truthy for.
//
// Example
// ```javascript
// const predicate = node => node.type === schema.nodes.blockquote;
// const parent = findParentNode(predicate)(selection);
// ```
export const findParentNode = predicate => selection => {
  const { $from } = selection;
  for (let i = $from.depth; i > 0; i--) {
    const node = $from.node(i);
    if (predicate(node)) {
      return {
        pos: $from.start(i),
        node
      };
    }
  }
};

// :: (predicate: (node: ProseMirrorNode) → boolean, domAtPos: (pos: number) → {node: dom.Node, offset: number}) → (selection: Selection) → ?dom.Node
// Iterates over parent nodes, returning DOM reference of the closest node `predicate` returns truthy for.
//
// Example
// ```javascript
// const domAtPos = view.domAtPos.bind(view);
// const predicate = node => node.type === schema.nodes.table;
// const parent = findParentDomRef(predicate, domAtPos)(selection); // <table>
// ```
export const findParentDomRef = (predicate, domAtPos) => selection => {
  const parent = findParentNode(predicate)(selection);
  if (parent) {
    return findDomRefAtPos(parent.pos, domAtPos);
  }
};

// :: (predicate: (node: ProseMirrorNode) → boolean) → (selection: Selection) → boolean
// Checks if there's a parent node `predicate` returns truthy for.
//
// Example
// ```javascript
// if (hasParentNode(node => node.type === schema.nodes.table)(selection)) {
//   // ....
// }
// ```
export const hasParentNode = predicate => selection => {
  return !!findParentNode(predicate)(selection);
};

// :: (nodeType: union<NodeType, [NodeType]>) → (selection: Selection) → ?{node: ProseMirrorNode, pos: number}
// Iterates over parent nodes, returning closest node of a given `nodeType`.
//
// Example
// ```javascript
// const parent = findParentNodeOfType(schema.nodes.paragraph)(selection);
// ```
export const findParentNodeOfType = nodeType => selection => {
  return findParentNode(node => equalNodeType(nodeType, node))(selection);
};

// :: (nodeType: union<NodeType, [NodeType]>) → (selection: Selection) → boolean
// Checks if there's a parent node of a given `nodeType`.
//
// Example
// ```javascript
// if (hasParentNodeOfType(schema.nodes.table)(selection)) {
//   // ....
// }
// ```
export const hasParentNodeOfType = nodeType => selection => {
  return hasParentNode(node => equalNodeType(nodeType, node))(selection);
};

// :: (nodeType: union<NodeType, [NodeType]>, domAtPos: (pos: number) → {node: dom.Node, offset: number}) → (selection: Selection) → ?dom.Node
// Iterates over parent nodes, returning DOM reference of the closest node of a given `nodeType`.
//
// Example
// ```javascript
// const domAtPos = view.domAtPos.bind(view);
// const parent = findParentDomRefOfType(schema.nodes.codeBlock, domAtPos)(selection); // <pre>
// ```
export const findParentDomRefOfType = (nodeType, domAtPos) => selection => {
  return findParentDomRef(node => equalNodeType(nodeType, node), domAtPos)(
    selection
  );
};

// :: (nodeType: union<NodeType, [NodeType]>) → (selection: Selection) → ?{node: ProseMirrorNode, pos: number}
// Returns a node of a given `nodeType` if it is selected.
//
// Example
// ```javascript
// const { extension, inlineExtension, bodiedExtension } = schema.nodes;
// const selectedNode = findSelectedNodeOfType([
//   extension,
//   inlineExtension,
//   bodiedExtension,
// ])(selection);
// ```
export const findSelectedNodeOfType = nodeType => selection => {
  if (isNodeSelection(selection)) {
    const { node, $from } = selection;
    if (equalNodeType(nodeType, node)) {
      return { node, pos: $from.pos };
    }
  }
};

// :: (selection: Selection) → ?number
// Returns position of the previous node.
//
// Example
// ```javascript
// const pos = findPositionOfNodeBefore(tr.selection);
// ```
export const findPositionOfNodeBefore = selection => {
  const { nodeBefore } = selection.$from;
  const maybeSelection = Selection.findFrom(selection.$from, -1);
  if (maybeSelection && nodeBefore) {
    // leaf node
    if (maybeSelection.$from.depth === 0) {
      return maybeSelection.$from.pos + 1;
    }

    const parent = findParentNodeOfType(nodeBefore.type)(maybeSelection);
    if (parent) {
      return parent.pos;
    }
  }
};

// :: (position: number, domAtPos: (pos: number) → {node: dom.Node, offset: number}) → dom.Node
// Returns DOM reference of a node at a given `position`.
// @see https://github.com/atlassian/prosemirror-utils/issues/8 for more context.
//
// Example
// ```javascript
// const domAtPos = view.domAtPos.bind(view);
// const ref = findDomRefAtPos($from.pos, domAtPos);
// ```
export const findDomRefAtPos = (position, domAtPos) => {
  const dom = domAtPos(position);
  if (dom.offset > 0) {
    return dom.node.childNodes[dom.offset - 1];
  }
  return dom.node;
};
