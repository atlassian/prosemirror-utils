import { Selection, NodeSelection, type Transaction } from 'prosemirror-state';
import { Fragment, Node as PMNode, type ResolvedPos } from 'prosemirror-model';
import { setTextSelection } from './transforms';
import type { NodeTypeParam, Content } from './types';

// Checks if current selection is a `NodeSelection`.
//
// ```javascript
// if (isNodeSelection(tr.selection)) {
//   // ...
// }
// ```
export const isNodeSelection = (
  selection: Selection
): selection is NodeSelection => {
  return selection instanceof NodeSelection;
};

// Checks if the type a given `node` equals to a given `nodeType`.
export const equalNodeType = (
  nodeType: NodeTypeParam,
  node: PMNode
): boolean => {
  return (
    (Array.isArray(nodeType) && nodeType.indexOf(node.type) > -1) ||
    node.type === nodeType
  );
};

// Creates a new transaction object from a given transaction
export const cloneTr = (tr: Transaction): Transaction => {
  return Object.assign(Object.create(tr), tr).setTime(Date.now());
};

// Returns a `replace` transaction that replaces a node at a given position with the given `content`.
// It will return the original transaction if replacing is not possible.
// `position` should point at the position immediately before the node.
export const replaceNodeAtPos =
  (position: number, content: Content) =>
  (tr: Transaction): Transaction => {
    const node = tr.doc.nodeAt(position);
    const $pos = tr.doc.resolve(position);
    if (!node) {
      return tr;
    }

    if (canReplace($pos, content)) {
      tr = tr.replaceWith(position, position + node.nodeSize, content);
      const start = tr.selection.$from.pos - 1;
      // put cursor inside of the inserted node
      tr = setTextSelection(Math.max(start, 0), -1)(tr);
      // move cursor to the start of the node
      tr = setTextSelection(tr.selection.$from.start())(tr);
      return cloneTr(tr);
    }
    return tr;
  };

// Checks if replacing a node at a given `$pos` inside of the `doc` node with the given `content` is possible.
export const canReplace = ($pos: ResolvedPos, content: Content): boolean => {
  const node = $pos.node($pos.depth);
  return (
    node &&
    node.type.validContent(
      content instanceof Fragment ? content : Fragment.from(content)
    )
  );
};

// Returns a `delete` transaction that removes a node at a given position with the given `node`.
// `position` should point at the position immediately before the node.
export const removeNodeAtPos =
  (position: number) =>
  (tr: Transaction): Transaction => {
    const node = tr.doc.nodeAt(position);
    if (!node) {
      return tr;
    }

    return cloneTr(tr.delete(position, position + node.nodeSize));
  };

// Checks if a given `content` can be inserted at the given `$pos`
//
// ```javascript
// const { selection: { $from } } = state;
// const node = state.schema.nodes.atom.createChecked();
// if (canInsert($from, node)) {
//   // ...
// }
// ```
export const canInsert = ($pos: ResolvedPos, content: Content): boolean => {
  const index = $pos.index();

  if (content instanceof Fragment) {
    return $pos.parent.canReplace(index, index, content);
  } else if (content instanceof PMNode) {
    return $pos.parent.canReplaceWith(index, index, content.type);
  }
  return false;
};

// Checks if a given `node` is an empty paragraph
export const isEmptyParagraph = (node: PMNode): boolean => {
  return !node || (node.type.name === 'paragraph' && node.nodeSize === 2);
};

export const checkInvalidMovements = (
  originIndex: number,
  targetIndex: number,
  targets: number[],
  type: unknown
): boolean => {
  const direction = originIndex > targetIndex ? -1 : 1;
  const errorMessage = `Target position is invalid, you can't move the ${type} ${originIndex} to ${targetIndex}, the target can't be split. You could use tryToFit option.`;

  if (direction === 1) {
    if (targets.slice(0, targets.length - 1).indexOf(targetIndex) !== -1) {
      throw new Error(errorMessage);
    }
  } else {
    if (targets.slice(1).indexOf(targetIndex) !== -1) {
      throw new Error(errorMessage);
    }
  }

  return true;
};
