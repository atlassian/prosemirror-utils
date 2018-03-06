# Utils library for ProseMirror

WIP.

## Documentation

Geting the parent node based on the current cursor position:

 * **`findParentNode`**`(predicate: fn(node: ProseMirrorNode) → boolean) → fn(state: EditorState) → ?{node: ProseMirrorNode, pos: number}`\
   Iterates over parent nodes, returning first node `predicate` returns truthy for.


 * **`findParentDomRef`**`(predicate: fn(node: ProseMirrorNode) → boolean, domAtPos: fn(pos: number) → {node: HTMLElement, offset: number}) → fn(state: EditorState) → ?HTMLElement`\
   Iterates over parent nodes, returning DOM reference of the first node `predicate` returns truthy for.


 * **`hasParentNode`**`(predicate: fn(node: ProseMirrorNode) → boolean) → fn(state: EditorState) → boolean`\
   Checks if there's a parent node `predicate` returns truthy for.


 * **`findParentNodeOfType`**`(nodeType: NodeType) → fn(state: EditorState) → ?{node: ProseMirrorNode, pos: number}`\
   Iterates over parent nodes, returning first node of the given `nodeType`.


 * **`hasParentNodeOfType`**`(nodeType: NodeType) → fn(state: EditorState) → boolean`\
   Checks if there's a parent node of the given `nodeType`.


 * **`findParentDomRefOfType`**`(nodeType: NodeType, domAtPos: fn(pos: number) → {node: HTMLElement, offset: number}) → fn(state: EditorState) → ?HTMLElement`\
   Iterates over parent nodes, returning DOM reference of the first node of the given `nodeType`.


Geting descendants of a given node:

 * **`flatten`**`(node: ProseMirrorNode, descend: ?boolean = true) → [{node: ProseMirrorNode, pos: number}]`\
   Flattens descendants of a given `node`. Doesn't descend into a `node` when `descend` argument is `false`. Defaults to `true`.


 * **`findChildren`**`(node: ProseMirrorNode, predicate: fn(node: ProseMirrorNode) → boolean, descend: ?boolean) → [{node: ProseMirrorNode, pos: number}]`\
   Iterates over descendants of a given `node`, returning child nodes `predicate` returns truthy for. Doesn't descend into a `node` when `descend` argument is `false`.


 * **`findTextNodes`**`(node: ProseMirrorNode, descend: ?boolean) → [{node: ProseMirrorNode, pos: number}]`\
   Returns text nodes of a given `node`. Doesn't descend into a `node` when `descend` argument is `false`.


 * **`findInlineNodes`**`(node: ProseMirrorNode, descend: ?boolean) → [{node: ProseMirrorNode, pos: number}]`\
   Returns inline nodes of a given `node`. Doesn't descend into a `node` when `descend` argument is `false`.


 * **`findBlockNodes`**`(node: ProseMirrorNode, descend: ?boolean) → [{node: ProseMirrorNode, pos: number}]`\
   Returns block descendants of a given `node`. Doesn't descend into a `node` when `descend` argument is `false`.


 * **`findChildrenByAttr`**`(node: ProseMirrorNode, predicate: fn(attrs: ?Object) → boolean, descend: ?boolean) → [{node: ProseMirrorNode, pos: number}]`\
   Iterates over descendants of a given `node`, returning child nodes `predicate` returns truthy for.
   exapmle: `findChildrenByAttr(table, attrs => attrs.colspan > 1)`. Doesn't descend into a `node` when `descend` argument is `false`.


 * **`findChildrenByType`**`(node: ProseMirrorNode, nodeType: NodeType, descend: ?boolean) → [{node: ProseMirrorNode, pos: number}]`\
   Iterates over descendants of a given `node`, returning child nodes of a given `nodeType`. Doesn't descend into a `node` when `descend` argument is `false`.
   exapmle: `findChildrenByType(table, schema.nodes.tableRow)`


 * **`findChildrenByMark`**`(node: ProseMirrorNode, markType: markType, descend: ?boolean) → [{node: ProseMirrorNode, pos: number}]`\
   Iterates over descendants of a given `node`, returning child nodes that have a mark of a given `markType`. Doesn't descend into a `node` when `descend` argument is `false`.
   exapmle: `findChildrenByMark(paragraph, schema.marks.strong)`



