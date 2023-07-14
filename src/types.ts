import type { Node as PMNode, NodeType, Fragment } from 'prosemirror-model';

export type DomAtPos = (pos: number) => { node: Node; offset: number };
export type FindPredicate = (node: PMNode) => boolean;
export type FindResult =
  | {
      pos: number;
      start: number;
      depth: number;
      node: PMNode;
    }
  | undefined;

export type Attrs = { [key: string]: unknown };
export type NodeTypeParam = NodeType | Array<NodeType>;
export type Content = PMNode | Fragment;
