import { NodeSelection } from "prosemirror-state";

// :: (selection: Selection) → boolean
// Checks if current selection is a NodeSelection
export const isNodeSelection = selection => {
  return selection instanceof NodeSelection;
};

// (nodeType: union<NodeType, [NodeType]>) → boolean
// Checks if the type a given `node` equals to a given `nodeType`.
export const equalNodeType = (nodeType, node) => {
  return (
    (Array.isArray(nodeType) && nodeType.indexOf(node.type) > -1) ||
    node.type === nodeType
  );
};

// (tr: Transaction) → Transaction
// Creates a new transaction object from a given transaction
export const cloneTr = tr => {
  return Object.assign(Object.create(tr), tr).setTime(Date.now());
};

// (position: number, node: ProseMirrorNode) → (tr: Transaction) → Transaction
// Returns a `delete` transaction that removes a node at a given position with the given `node`.
// It will return the original transaction if replacing is not possible.
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
    return cloneTr(tr.replaceWith(from, to, node));
  }
  return tr;
};

// (position: number, node: ProseMirrorNode) → (tr: Transaction) → Transaction
// Returns a `delete` transaction that removes a node at a given position with the given `node`.
export const removeNodeAtPos = (position, node) => tr => {
  const $pos = tr.doc.resolve(position);
  const from = $pos.before($pos.depth);
  const to = $pos.after($pos.depth);
  return cloneTr(tr.delete(from, to));
};
