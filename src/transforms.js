import { findParentNodeOfType } from './ancestors';

// :: (nodeType: NodeType) → (tr: Transaction) → ?Transaction
// Returns a `delete` transaction that removes parent node of a given `nodeType`.
export const removeParentNodeOfType = (nodeType) => (tr) => {
  const parent = findParentNodeOfType(nodeType)(tr.curSelection);
  if (parent) {
    const $pos = tr.doc.resolve(parent.pos);
    const from = $pos.before($pos.depth);
    const to = $pos.after($pos.depth);
    return tr.delete(from, to);
  }
}

// :: (nodeType: NodeType, node: ProseMirrorNode) → (tr: Transaction) → ?Transaction
// Returns a `replace` transaction that replaces parent node of a given `nodeType` with the given `node`.
export const replaceParentNodeOfTypeWith = (nodeType, node) => (tr) => {
  const parent = findParentNodeOfType(nodeType)(tr.curSelection);
  if (parent) {
    const $pos = tr.doc.resolve(parent.pos);
    const from = $pos.before($pos.depth);
    const to = $pos.after($pos.depth);
    if (tr.doc.canReplaceWith($pos.index($pos.depth), $pos.indexAfter($pos.depth), node.type)) {
      return tr.replaceWith(from, to, node);
    }
  }
}
