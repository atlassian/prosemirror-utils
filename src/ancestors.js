// (predicate: (node: ProseMirrorNode) → boolean) → (state: EditorState) → ?{pos: number, node: ProseMirrorNode}
// Iterates over parent nodes, returning the first node and its position `predicate` returns truthy for.
const findParent = (predicate) => (state) => {
  const { $from } = state.selection;
  for (let i = $from.depth; i > 0; i--) {
    const node = $from.node(i);
    if (predicate(node)) {
      return {
        pos: $from.start(i),
        node,
      }
    }
  }
}

// :: (predicate: (node: ProseMirrorNode) → boolean) → (state: EditorState) → ?{node: ProseMirrorNode, pos: number}
// Iterates over parent nodes, returning first node `predicate` returns truthy for.
export const findParentNode = (predicate) => (state) => {
  const parent = findParent(predicate)(state);
  if (parent) {
    return parent;
  }
}

// :: (predicate: (node: ProseMirrorNode) → boolean, domAtPos: (pos: number) → {node: HTMLElement, offset: number}) → (state: EditorState) → ?HTMLElement
// Iterates over parent nodes, returning DOM reference of the first node `predicate` returns truthy for.
export const findParentDomRef = (predicate, domAtPos) => (state) => {
  const parent = findParent(predicate)(state);
  if (parent) {
    return domAtPos(parent.pos).node;
  }
}

// :: (predicate: (node: ProseMirrorNode) → boolean) → (state: EditorState) → boolean
// Checks if there's a parent node `predicate` returns truthy for.
export const hasParentNode = (predicate) => (state) => {
  return !!findParent(predicate)(state);
}

// :: (nodeType: NodeType) → (state: EditorState) → ?{node: ProseMirrorNode, pos: number}
// Iterates over parent nodes, returning first node of the given `nodeType`.
export const findParentNodeOfType = (nodeType) => (state) => {
  return findParentNode(node => node.type === nodeType)(state);
}

// :: (nodeType: NodeType) → (state: EditorState) → boolean
// Checks if there's a parent node of the given `nodeType`.
export const hasParentNodeOfType = (nodeType) => (state) => {
  return hasParentNode(node => node.type === nodeType)(state);
}

// :: (nodeType: NodeType, domAtPos: (pos: number) → {node: HTMLElement, offset: number}) → (state: EditorState) → ?HTMLElement
// Iterates over parent nodes, returning DOM reference of the first node of the given `nodeType`.
export const findParentDomRefOfType = (nodeType, domAtPos) => (state) => {
  return findParentDomRef(node => node.type === nodeType, domAtPos)(state);
}
