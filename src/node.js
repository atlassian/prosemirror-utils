// :: (node: ProseMirrorNode, descend: ?boolean) → [{ node: ProseMirrorNode, pos: number }]
// Flattens descendants of a given `node`. Doesn't descend into a `node` when `descend` argument is `false`. Defaults to `true`.
export const flatten = (node, descend = true) => {
  if (!node) {
    throw new Error('Invalid "node" parameter');
  }
  const result = [];
  node.descendants((child, pos) => {
    result.push({ node: child, pos });
    if (!descend) {
      return false;
    }
  });
  return result;
};

// :: (node: ProseMirrorNode, predicate: (node: ProseMirrorNode) → boolean, descend: ?boolean) → [{ node: ProseMirrorNode, pos: number }]
// Iterates over descendants of a given `node`, returning child nodes `predicate` returns truthy for. Doesn't descend into a `node` when `descend` argument is `false`.
export const findChildren = (node, predicate, descend) => {
  if (!node) {
    throw new Error('Invalid "node" parameter');
  } else if (!predicate) {
    throw new Error('Invalid "predicate" parameter');
  }
  return flatten(node, descend).filter(child => predicate(child.node));
};

// :: (node: ProseMirrorNode, descend: ?boolean) → [{ node: ProseMirrorNode, pos: number }]
// Returns text nodes of a given `node`. Doesn't descend into a `node` when `descend` argument is `false`.
export const findTextNodes = (node, descend) => {
  return findChildren(node, child => child.isText, descend);
};

// :: (node: ProseMirrorNode, descend: ?boolean) → [{ node: ProseMirrorNode, pos: number }]
// Returns inline nodes of a given `node`. Doesn't descend into a `node` when `descend` argument is `false`.
export const findInlineNodes = (node, descend) => {
  return findChildren(node, child => child.isInline, descend);
};

// :: (node: ProseMirrorNode, descend: ?boolean) → [{ node: ProseMirrorNode, pos: number }]
// Returns block descendants of a given `node`. Doesn't descend into a `node` when `descend` argument is `false`.
export const findBlockNodes = (node, descend) => {
  return findChildren(node, child => child.isBlock, descend);
};

// :: (node: ProseMirrorNode, predicate: (attrs: ?Object) → boolean, descend: ?boolean) → [{ node: ProseMirrorNode, pos: number }]
// Iterates over descendants of a given `node`, returning child nodes `predicate` returns truthy for. Doesn't descend into a `node` when `descend` argument is `false`.
export const findChildrenByAttr = (node, predicate, descend) => {
  return findChildren(node, child => !!predicate(child.attrs), descend);
};

// :: (node: ProseMirrorNode, nodeType: NodeType, descend: ?boolean) → [{ node: ProseMirrorNode, pos: number }]
// Iterates over descendants of a given `node`, returning child nodes of a given `nodeType`. Doesn't descend into a `node` when `descend` argument is `false`.
export const findChildrenByType = (node, nodeType, descend) => {
  return findChildren(node, child => child.type === nodeType, descend);
};

// :: (node: ProseMirrorNode, markType: markType, descend: ?boolean) → [{ node: ProseMirrorNode, pos: number }]
// Iterates over descendants of a given `node`, returning child nodes that have a mark of a given `markType`. Doesn't descend into a `node` when `descend` argument is `false`.
// exapmle: `findChildrenByMark(paragraph, schema.marks.strong)`
export const findChildrenByMark = (node, markType, descend) => {
  return findChildren(node, child => markType.isInSet(child.marks), descend);
};

// :: (node: ProseMirrorNode, nodeType: NodeType) → boolean
// Returns `true` if a given `node` contains nodes of a given `nodeType`
export const contains = (node, nodeType) => {
  return !!findChildrenByType(node, nodeType).length;
};
