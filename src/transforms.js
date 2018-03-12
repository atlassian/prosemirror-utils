import { findParentNodeOfType } from './ancestors';

// (position: number, node: ProseMirrorNode) → (tr: Transaction) → ?Transaction
// Returns a `delete` transaction that removes a node at a given position with the given `node`.
export const replaceNodeAtPos = (position, node) => (tr) => {
  const $pos = tr.doc.resolve(position);
  const from = $pos.before($pos.depth);
  const to = $pos.after($pos.depth);
  if (tr.doc.canReplaceWith($pos.index($pos.depth), $pos.indexAfter($pos.depth), node.type)) {
    return tr.replaceWith(from, to, node);
  }
}

// (position: number, node: ProseMirrorNode) → (tr: Transaction) → ?Transaction
// Returns a `delete` transaction that removes a node at a given position with the given `node`.
export const removeNodeAtPos = (position, node) => (tr) => {
  const $pos = tr.doc.resolve(position);
  const from = $pos.before($pos.depth);
  const to = $pos.after($pos.depth);
  return tr.delete(from, to);
}

// :: (nodeType: NodeType) → (tr: Transaction) → ?Transaction
// Returns a `replace` transaction that replaces a node of a given `nodeType` with the given `node`.
export const removeParentNodeOfType = (nodeType) => (tr) => {
  const parent = findParentNodeOfType(nodeType)(tr.curSelection);
  if (parent) {
    return removeNodeAtPos(parent.pos)(tr);
  }
}

// :: (nodeType: NodeType, node: ProseMirrorNode) → (tr: Transaction) → ?Transaction
// Returns a `replace` transaction that replaces parent node of a given `nodeType` with the given `node`.
export const replaceParentNodeOfType = (nodeType, node) => (tr) => {
  const parent = findParentNodeOfType(nodeType)(tr.curSelection);
  if (parent) {
    return replaceNodeAtPos(parent.pos, node)(tr);
  }
}
