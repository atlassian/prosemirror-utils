import { Node as ProsemirrorNode, Schema, NodeType, Mark, MarkType, ResolvedPos, Fragment } from 'prosemirror-model';
import { Selection, Transaction } from 'prosemirror-state';

export type Predicate = (node: ProsemirrorNode) => boolean;

export type DomAtPos = (pos: number) => {node: Node, offset: number};

export type ContentNodeWithPos = {pos: number, start: number, depth: number, node: ProsemirrorNode};

export type NodeWithPos = {pos: number, node: ProsemirrorNode};

export type CellTransform = (cell: ContentNodeWithPos, tr: Transaction) => Transaction;

export type MovementOptions = { tryToFit: boolean, direction?: -1 | 0 | 1 };

// Selection
export function findParentNode(predicate: Predicate): (selection: Selection) => ContentNodeWithPos | undefined;

export function findParentNodeClosestToPos($pos: ResolvedPos, predicate: Predicate): ContentNodeWithPos | undefined;

export function findParentDomRef(predicate: Predicate, domAtPos: DomAtPos): (selection: Selection) => Node | undefined;

export function hasParentNode(predicate: Predicate): (selection: Selection) => boolean;

export function findParentNodeOfType(nodeType: NodeType | NodeType[]): (selection: Selection) => ContentNodeWithPos | undefined;

export function findParentNodeOfTypeClosestToPos($pos: ResolvedPos, nodeType: NodeType | NodeType[]): ContentNodeWithPos | undefined;

export function hasParentNodeOfType(nodeType: NodeType | NodeType[]): (selection: Selection) => boolean;

export function findParentDomRefOfType(nodeType: NodeType | NodeType[], domAtPos: DomAtPos): (selection: Selection) => Node | undefined;

export function findSelectedNodeOfType(nodeType: NodeType | NodeType[]): (selection: Selection) => ContentNodeWithPos | undefined;

export function isNodeSelection(selection: Selection): boolean;

export function findPositionOfNodeBefore(selection: Selection): number | undefined;

export function findDomRefAtPos(position: number, domAtPos: DomAtPos): Node;

// Node
export function flatten(node: ProsemirrorNode, descend?: boolean): NodeWithPos[];

export function findChildren(node: ProsemirrorNode, predicate: Predicate, descend?: boolean): NodeWithPos[];

export function findTextNodes(node: ProsemirrorNode, descend?: boolean): NodeWithPos[];

export function findInlineNodes(node: ProsemirrorNode, descend?: boolean): NodeWithPos[];

export function findBlockNodes(node: ProsemirrorNode, descend?: boolean): NodeWithPos[];

export function findChildrenByAttr(node: ProsemirrorNode, predicate: Predicate, descend?: boolean): NodeWithPos[];

export function findChildrenByType(node: ProsemirrorNode, nodeType: NodeType, descend?: boolean): NodeWithPos[];

export function findChildrenByMark(node: ProsemirrorNode, markType: MarkType, descend?: boolean): NodeWithPos[];

export function contains(node: ProsemirrorNode, nodeType: NodeType): boolean;

// Transforms
export function removeParentNodeOfType(nodeType: NodeType | NodeType[]): (tr: Transaction) => Transaction;

export function replaceParentNodeOfType(nodeType: NodeType | NodeType[], node: ProsemirrorNode): (tr: Transaction) => Transaction;

export function removeSelectedNode(tr: Transaction): Transaction;

export function replaceSelectedNode(node: ProsemirrorNode): (tr: Transaction) => Transaction;

export function canInsert($pos: ResolvedPos, node: ProsemirrorNode | Fragment): boolean;

export function safeInsert(node: ProsemirrorNode | Fragment, position?: number, tryToReplace?: boolean): (tr: Transaction) => Transaction;

export function setParentNodeMarkup(nodeType: NodeType | NodeType[], type?: NodeType | null, attrs?: { [key: string]: any } | null, marks?: Mark[]): (tr: Transaction) => Transaction;

export function selectParentNodeOfType(nodeType: NodeType | NodeType[]): (tr: Transaction) => Transaction;

export function removeNodeBefore(tr: Transaction): Transaction;

export function setTextSelection(position: number, dir?: number): (tr: Transaction) => Transaction;
