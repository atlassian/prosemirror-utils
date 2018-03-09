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
