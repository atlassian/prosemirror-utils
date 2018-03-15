import { Node as ProsemirrorNode, NodeType, MarkType } from 'prosemirror-model';
import { Selection, Transaction } from 'prosemirror-state';

export type Predicate = (node: ProsemirrorNode) => boolean;

export type DomAtPos = (pos: number) => {node: Node, offset: number};

// ancestors
export function findParentNode(predicate: Predicate): (selection: Selection) => {pos: number, node: ProsemirrorNode} | undefined;

export function findParentDomRef(predicate: Predicate, domAtPos: DomAtPos): (selection: Selection) => Node | undefined;

export function hasParentNode(predicate: Predicate): (selection: Selection) => boolean;

export function findParentNodeOfType(nodeType: NodeType): (selection: Selection) => {pos: number, node: ProsemirrorNode} | undefined;

export function hasParentNodeOfType(nodeType: NodeType): (selection: Selection) => boolean;

export function findParentDomRefOfType(nodeType: NodeType, domAtPos: DomAtPos): (selection: Selection) => Node | undefined;

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
export function findTable(selection: Selection): {pos: number, node: ProsemirrorNode} | undefined;

export function isCellSelection(selection: Selection): boolean;

export function isColumnSelected(columnIndex: number): (selection: Selection) => boolean;

export function isRowSelected(rowIndex: number): (selection: Selection) =>  boolean;

export function isTableSelected(selection: Selection): boolean;

export function getCellsInColumn(columnIndex: number): (selection: Selection) => {pos: number, node: ProsemirrorNode}[] | undefined;

export function getCellsInRow(rowIndex: number): (selection: Selection) => {pos: number, node: ProsemirrorNode}[] | undefined;

export function getCellsInTable(selection: Selection): {pos: number, node: ProsemirrorNode}[] | undefined;

// Transforms
export function removeParentNodeOfType(nodeType: NodeType): (tr: Transaction) => Transaction;

export function replaceParentNodeOfType(nodeType: NodeType, node: ProsemirrorNode): (tr: Transaction) => Transaction;

export function removeSelectedNode(tr: Transaction): Transaction;

export function replaceSelectedNode(node: ProsemirrorNode): (tr: Transaction) => Transaction;

export function safeInsert(node: ProsemirrorNode): (tr: Transaction) => Transaction;
