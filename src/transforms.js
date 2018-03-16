import { findParentNodeOfType } from "./selection";
import { cloneTr, replaceNodeAtPos, removeNodeAtPos } from "./helpers";

// :: (nodeType: union<NodeType, [NodeType]>) → (tr: Transaction) → Transaction
// Returns a new transaction that removes a node of a given `nodeType`.
// It will return the original transaction if parent node hasn't been found.
export const removeParentNodeOfType = nodeType => tr => {
  const parent = findParentNodeOfType(nodeType)(tr.curSelection);
  if (parent) {
    return removeNodeAtPos(parent.pos)(tr);
  }
  return tr;
};

// :: (nodeType: union<NodeType, [NodeType]>, node: ProseMirrorNode) → (tr: Transaction) → Transaction
// Returns a new transaction that replaces parent node of a given `nodeType` with the given `node`.
// It will return the original transaction if parent node hasn't been found, or replacing is not possible.
export const replaceParentNodeOfType = (nodeType, node) => tr => {
  const parent = findParentNodeOfType(nodeType)(tr.curSelection);
  if (parent) {
    return replaceNodeAtPos(parent.pos, node)(tr);
  }
  return tr;
};

// :: (tr: Transaction) → Transaction
// Returns a new transaction that removes selected node.
// It will return the original transaction if current selection is not a NodeSelection
export const removeSelectedNode = tr => {
  // NodeSelection
  if (tr.curSelection.node) {
    const from = tr.curSelection.$from.pos;
    const to = tr.curSelection.$to.pos;
    return cloneTr(tr.delete(from, to));
  }
  return tr;
};

// :: (node: ProseMirrorNode) → (tr: Transaction) → Transaction
// Returns a new transaction that replaces selected node with a given `node`.
// It will return the original transaction if current selection is not a NodeSelection, or replacing is not possible.
export const replaceSelectedNode = node => tr => {
  // NodeSelection
  if (tr.curSelection.node) {
    const { $from, $to } = tr.curSelection;
    if (
      $from.parent.canReplaceWith($from.index(), $from.indexAfter(), node.type)
    ) {
      return cloneTr(tr.replaceWith($from.pos, $to.pos, node));
    }
  }
  return tr;
};

// :: (node: ProseMirrorNode) → (tr: Transaction) → Transaction
// Returns a new transaction that inserts a given `node` at the current cursor position if it is allowed by schema. If schema restricts such nesting, it will try to find an appropriate place for a given `node` in the document, looping through parent nodes up until the root document node.
// It will return the original transaction if the place for insertion hasn't been found.
export const safeInsert = node => tr => {
  const { $from } = tr.curSelection;
  const index = $from.index();

  // given node is allowed at the current cursor position
  if ($from.parent.canReplaceWith(index, index, node.type)) {
    return cloneTr(tr.insert($from.pos, node));
  }

  // looking for a place in the doc where the node is allowed
  for (let i = $from.depth; i > 0; i--) {
    const pos = $from.after(i);
    const $pos = tr.doc.resolve(pos);
    const index = $pos.index();
    if ($pos.parent.canReplaceWith(index, index, node.type)) {
      return cloneTr(tr.insert(pos, node));
    }
  }
  return tr;
};

// :: (nodeType: union<NodeType, [NodeType]>, type: ?union<NodeType, null>, attrs: ?union<Object, null>, marks?: [Mark]) → (tr: Transaction) → Transaction
// Returns a transaction that changes the type, attributes, and/or marks of the parent node of a given `nodeType`.
export const setParentNodeMarkup = (nodeType, type, attrs, marks) => tr => {
  const parent = findParentNodeOfType(nodeType)(tr.curSelection);
  if (parent) {
    return cloneTr(
      tr.setNodeMarkup(
        parent.pos - 1,
        type,
        Object.assign({}, parent.node.attrs, attrs),
        marks
      )
    );
  }
  return tr;
};
