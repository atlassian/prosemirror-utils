import { findParentNodeOfType } from './ancestors';

// :: (nodeType: NodeType) → (state: EditorState) → ?Transaction
// Returns a `delete` transaction that removes parent node of a given `nodeType`.
export const removeParentNodeOfType = (nodeType) => (state) => {
  const parent = findParentNodeOfType(nodeType)(state);
  if (parent) {
    const $pos = state.doc.resolve(parent.pos);
    const from = $pos.before($pos.depth);
    const to = $pos.after($pos.depth);
    return state.tr.delete(from, to);
  }
}

// :: (nodeType: NodeType, node: ProseMirrorNode) → (state: EditorState) → ?Transaction
// Returns a `replace` transaction that replaces parent node of a given `nodeType` with the given `node`.
export const replaceParentNodeOfTypeWith = (nodeType, node) => (state) => {
  const parent = findParentNodeOfType(nodeType)(state);
  if (parent) {
    const $pos = state.doc.resolve(parent.pos);
    const from = $pos.before($pos.depth);
    const to = $pos.after($pos.depth);
    if (state.doc.canReplaceWith($pos.index($pos.depth), $pos.indexAfter($pos.depth), node.type)) {
      return state.tr.replaceWith(from, to, node);
    }
  }
}
