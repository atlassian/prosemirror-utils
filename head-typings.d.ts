import { Node as ProseMirrorNode, Schema, NodeType, Mark, MarkType, ResolvedPos, Fragment } from 'prosemirror-model';
import { Selection, Transaction } from 'prosemirror-state';

export type Predicate = (node: ProseMirrorNode) => boolean;

export type DomAtPos = (pos: number) => {node: Node, offset: number};

export type ContentNodeWithPos = {pos: number, start: number, depth: number, node: ProseMirrorNode};

export type NodeWithPos = {pos: number, node: ProseMirrorNode};

export type CellTransform = (cell: ContentNodeWithPos, tr: Transaction) => Transaction;
