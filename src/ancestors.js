// :: (predicate: (node: ProseMirrorNode) → boolean) → (selection: Selection) → ?{pos: number, node: ProseMirrorNode}
// Iterates over parent nodes, returning the first node and its position `predicate` returns truthy for.
export const findParentNode = predicate => selection => {
  const { $from } = selection;
  for (let i = $from.depth; i > 0; i--) {
    const node = $from.node(i);
    if (predicate(node)) {
      return {
        pos: $from.start(i),
        node
      };
    }
  }
};

// :: (predicate: (node: ProseMirrorNode) → boolean, domAtPos: (pos: number) → {node: HTMLElement, offset: number}) → (selection: Selection) → ?HTMLElement
// Iterates over parent nodes, returning DOM reference of the first node `predicate` returns truthy for.
export const findParentDomRef = (predicate, domAtPos) => selection => {
  const parent = findParentNode(predicate)(selection);
  if (parent) {
    return domAtPos(parent.pos).node;
  }
};

// :: (predicate: (node: ProseMirrorNode) → boolean) → (selection: Selection) → boolean
// Checks if there's a parent node `predicate` returns truthy for.
export const hasParentNode = predicate => selection => {
  return !!findParentNode(predicate)(selection);
};

// :: (nodeType: NodeType) → (selection: Selection) → ?{node: ProseMirrorNode, pos: number}
// Iterates over parent nodes, returning first node of the given `nodeType`.
export const findParentNodeOfType = nodeType => selection => {
  return findParentNode(node => node.type === nodeType)(selection);
};

// :: (nodeType: NodeType) → (selection: Selection) → boolean
// Checks if there's a parent node of the given `nodeType`.
export const hasParentNodeOfType = nodeType => selection => {
  return hasParentNode(node => node.type === nodeType)(selection);
};

// :: (nodeType: NodeType, domAtPos: (pos: number) → {node: HTMLElement, offset: number}) → (selection: Selection) → ?HTMLElement
// Iterates over parent nodes, returning DOM reference of the first node of the given `nodeType`.
export const findParentDomRefOfType = (nodeType, domAtPos) => selection => {
  return findParentDomRef(node => node.type === nodeType, domAtPos)(selection);
};
