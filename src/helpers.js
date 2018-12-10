import { NodeSelection, Selection } from 'prosemirror-state';
import { Fragment, Node as PMNode } from 'prosemirror-model';
import { setTextSelection } from './transforms';
import { findParentNodeClosestToPos } from './selection';

// :: (selection: Selection) → boolean
// Checks if current selection is a `NodeSelection`.
//
// ```javascript
// if (isNodeSelection(tr.selection)) {
//   // ...
// }
// ```
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

// (position: number, content: union<ProseMirrorNode, Fragment>) → (tr: Transaction) → Transaction
// Returns a `replace` transaction that replaces a node at a given position with the given `content`.
// It will return the original transaction if replacing is not possible.
// `position` should point at the position immediately before the node.
export const replaceNodeAtPos = (position, content) => tr => {
  const node = tr.doc.nodeAt(position);
  const $pos = tr.doc.resolve(position);
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

// ($pos: ResolvedPos, doc: ProseMirrorNode, content: union<ProseMirrorNode, Fragment>, ) → boolean
// Checks if replacing a node at a given `$pos` inside of the `doc` node with the given `content` is possible.
export const canReplace = ($pos, content) => {
  const node = $pos.node($pos.depth);
  return (
    node &&
    node.type.validContent(
      content instanceof Fragment ? content : Fragment.from(content)
    )
  );
};

// (position: number) → (tr: Transaction) → Transaction
// Returns a `delete` transaction that removes a node at a given position with the given `node`.
// `position` should point at the position immediately before the node.
export const removeNodeAtPos = position => tr => {
  const node = tr.doc.nodeAt(position);
  return cloneTr(tr.delete(position, position + node.nodeSize));
};

// (schema: Schema) → {[key: string]: NodeType}
// Returns a map where keys are tableRoles and values are NodeTypes.
export const tableNodeTypes = schema => {
  if (schema.cached.tableNodeTypes) {
    return schema.cached.tableNodeTypes;
  }
  const roles = {};
  Object.keys(schema.nodes).forEach(type => {
    const nodeType = schema.nodes[type];
    if (nodeType.spec.tableRole) {
      roles[nodeType.spec.tableRole] = nodeType;
    }
  });
  schema.cached.tableNodeTypes = roles;
  return roles;
};

// :: ($pos: ResolvedPos, content: union<ProseMirrorNode, Fragment>) → boolean
// Checks if a given `content` can be inserted at the given `$pos`
//
// ```javascript
// const { selection: { $from } } = state;
// const node = state.schema.nodes.atom.createChecked();
// if (canInsert($from, node)) {
//   // ...
// }
// ```
export const canInsert = ($pos, content) => {
  const index = $pos.index();

  if (content instanceof Fragment) {
    return $pos.parent.canReplace(index, index, content);
  } else if (content instanceof PMNode) {
    return $pos.parent.canReplaceWith(index, index, content.type);
  }
  return false;
};

// (node: ProseMirrorNode) → boolean
// Checks if a given `node` is an empty paragraph
export const isEmptyParagraph = node => {
  return !node || (node.type.name === 'paragraph' && node.nodeSize === 2);
};

// ($pos: ResolvedPos) → ?{pos: number, start: number, node: ProseMirrorNode}
// Iterates over parent nodes, returning a table node closest to a given `$pos`.
//
// ```javascript
// const table = findTableClosestToPos(state.doc.resolve(10));
// ```
export const findTableClosestToPos = $pos => {
  const predicate = node =>
    node.type.spec.tableRole && /table/i.test(node.type.spec.tableRole);
  return findParentNodeClosestToPos($pos, predicate);
};

export const createCell = (cellType, withDefaultContent = null) => {
  if (withDefaultContent) {
    return cellType.createChecked(null, withDefaultContent);
  }

  return cellType.createAndFill();
};
