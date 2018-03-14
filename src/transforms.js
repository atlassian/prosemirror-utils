import { findParentNodeOfType } from "./ancestors";

// (position: number, node: ProseMirrorNode) → (tr: Transaction) → ?Transaction
// Returns a `delete` transaction that removes a node at a given position with the given `node`.
export const replaceNodeAtPos = (position, node) => tr => {
  const $pos = tr.doc.resolve(position);
  const from = $pos.before($pos.depth);
  const to = $pos.after($pos.depth);
  if (
    tr.doc.canReplaceWith(
      $pos.index($pos.depth),
      $pos.indexAfter($pos.depth),
      node.type
    )
  ) {
    return tr.replaceWith(from, to, node);
  }
};

// (position: number, node: ProseMirrorNode) → (tr: Transaction) → ?Transaction
// Returns a `delete` transaction that removes a node at a given position with the given `node`.
export const removeNodeAtPos = (position, node) => tr => {
  const $pos = tr.doc.resolve(position);
  const from = $pos.before($pos.depth);
  const to = $pos.after($pos.depth);
  return tr.delete(from, to);
};

// :: (nodeType: NodeType) → (tr: Transaction) → ?Transaction
// Returns a `replace` transaction that replaces a node of a given `nodeType` with the given `node`.
export const removeParentNodeOfType = nodeType => tr => {
  const parent = findParentNodeOfType(nodeType)(tr.curSelection);
  if (parent) {
    return removeNodeAtPos(parent.pos)(tr);
  }
};

// :: (nodeType: NodeType, node: ProseMirrorNode) → (tr: Transaction) → ?Transaction
// Returns a `replace` transaction that replaces parent node of a given `nodeType` with the given `node`.
export const replaceParentNodeOfType = (nodeType, node) => tr => {
  const parent = findParentNodeOfType(nodeType)(tr.curSelection);
  if (parent) {
    return replaceNodeAtPos(parent.pos, node)(tr);
  }
};

// :: (tr: Transaction) → ?Transaction
// Returns a `delete` transaction that removes selected node.
export const removeSelectedNode = tr => {
  // NodeSelection
  if (tr.curSelection.node) {
    const from = tr.curSelection.$from.pos;
    const to = tr.curSelection.$to.pos;
    return tr.delete(from, to);
  }
};

// :: (content: union<Fragment, Node, [Node]>) → (tr: Transaction) → ?Transaction
// Returns an `insert` transaction that inserts a given `content` at the current cursor position if its allowed.
// Otherwise it will try to find the appropriate place for such `content` in the document, looping through parent nodes up until the root document node.
export const safeInsert = content => tr => {
  const { $from } = tr.curSelection;
  const index = $from.index();

  // given content is allowed at the current cursor position
  if ($from.parent.canReplaceWith(index, index, content.type)) {
    return tr.insert($from.pos, content);
  }

  // looking for a place in the doc where the content is allowed
  for (let i = $from.depth; i > 0; i--) {
    const pos = $from.after(i);
    const $pos = tr.doc.resolve(pos);
    const index = $pos.index();
    if ($pos.parent.canReplaceWith(index, index, content.type)) {
      return tr.insert(pos, content);
    }
  }
};
