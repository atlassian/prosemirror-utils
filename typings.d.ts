import { Node as ProsemirrorNode, NodeType, MarkType } from 'prosemirror-model';
import { Selection, Transaction } from 'prosemirror-state';

export type Predicate = (node: ProsemirrorNode) => boolean;

export type DomAtPos = (pos: number) => {node: Node, offset: number};

export type NodeWithPos = {node: Node, pos: number};

// ancestors
export function findParentNode(predicate: Predicate): (selection: Selection) => {pos: number, node: ProsemirrorNode} | void;

export function findParentDomRef(predicate: Predicate, domAtPos: DomAtPos): (selection: Selection) => Node | void;

export function hasParentNode(predicate: Predicate): (selection: Selection) => boolean;

export function findParentNodeOfType(nodeType: NodeType): (selection: Selection) => {pos: number, node: ProsemirrorNode} | void;

export function hasParentNodeOfType(nodeType: NodeType): (selection: Selection) => boolean;

export function findParentDomRefOfType(nodeType: NodeType, domAtPos: DomAtPos): (selection: Selection) => Node | void;

// descendants
export function flatten(node: ProsemirrorNode, descend?: boolean): {pos: number, node: ProsemirrorNode}[];

export function findChildren(node: ProsemirrorNode, predicate: Predicate, descend?: boolean): {pos: number, node: ProsemirrorNode}[];

export function findTextNodes(node: ProsemirrorNode, descend?: boolean): {pos: number, node: ProsemirrorNode}[];

export function findInlineNodes(node: ProsemirrorNode, descend?: boolean): {pos: number, node: ProsemirrorNode}[];

export function findBlockNodes(node: ProsemirrorNode, descend?: boolean): {pos: number, node: ProsemirrorNode}[];

export function findChildrenByAttr(node: ProsemirrorNode, predicate: Predicate, descend?: boolean): {pos: number, node: ProsemirrorNode}[];

export function findChildrenByType(node: ProsemirrorNode, nodeType: NodeType, descend?: boolean): {pos: number, node: ProsemirrorNode}[];

export function findChildrenByMark(node: ProsemirrorNode, markType: MarkType, descend?: boolean): {pos: number, node: ProsemirrorNode}[];

export function contains(node: ProsemirrorNode, nodeType: NodeType): boolean;

// table
export function findTable(selection: Selection): {pos: number, node: ProsemirrorNode} | void;

export function isCellSelection(selection: Selection): boolean;

export function isColumnSelected(columnIndex: number): (selection: Selection) => boolean;

export function isRowSelected(rowIndex: number): (selection: Selection) =>  boolean;

export function isTableSelected(selection: Selection): boolean;

export function getCellsInColumn(columnIndex: number): (selection: Selection) => {pos: number, node: ProsemirrorNode}[] | void;

export function getCellsInRow(rowIndex: number): (selection: Selection) => {pos: number, node: ProsemirrorNode}[] | void;

export function getCellsInTable(selection: Selection): {pos: number, node: ProsemirrorNode}[] | void;

// Transforms
export function removeParentNodeOfType(nodeType: NodeType): (tr: Transaction) => Transaction | void;

export function replaceParentNodeOfType(nodeType: NodeType, node: ProsemirrorNode): (tr: Transaction) => Transaction | void;

export function removeSelectedNode(tr: Transaction): Transaction | void;

export function safeInsert(node: ProsemirrorNode): (tr: Transaction) => Transaction | void;
