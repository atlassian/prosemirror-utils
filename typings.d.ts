import { Node as ProseMirrorNode, Schema, NodeType, Mark, MarkType, ResolvedPos, Fragment } from 'prosemirror-model';
import { Selection, Transaction } from 'prosemirror-state';

export type Predicate = (node: ProseMirrorNode) => boolean;

export type DomAtPos = (pos: number) => {node: Node, offset: number};

export type ContentNodeWithPos = {pos: number, start: number, depth: number, node: ProseMirrorNode};

export type NodeWithPos = {pos: number, node: ProseMirrorNode};

export type CellTransform = (cell: ContentNodeWithPos, tr: Transaction) => Transaction;
export function findParentNode(predicate: Predicate) : (selection: Selection) => {pos: number, start: number, depth: number, node: ProseMirrorNode} | void
export function findParentNodeClosestToPos($pos: ResolvedPos, predicate: Predicate) : {pos: number, start: number, depth: number, node: ProseMirrorNode} | void
export function findParentDomRef(predicate: Predicate, domAtPos: DomAtPos) : (selection: Selection) => Node
export function hasParentNode(predicate: Predicate) : (selection: Selection) => boolean
export function findParentNodeOfType(nodeType: NodeType | NodeType[]) : (selection: Selection) => {pos: number, start: number, depth: number, node: ProseMirrorNode} | void
export function findParentNodeOfTypeClosestToPos($pos: ResolvedPos, nodeType: NodeType | NodeType[]) : {pos: number, start: number, depth: number, node: ProseMirrorNode} | void
export function hasParentNodeOfType(nodeType: NodeType | NodeType[]) : (selection: Selection) => boolean
export function findParentDomRefOfType(nodeType: NodeType | NodeType[], domAtPos: DomAtPos) : (selection: Selection) => Node
export function findSelectedNodeOfType(nodeType: NodeType | NodeType[]) : (selection: Selection) => {pos: number, start: number, depth: number, node: ProseMirrorNode} | void
export function isNodeSelection(selection: Selection) : boolean
export function findPositionOfNodeBefore(selection: Selection) : number
export function findDomRefAtPos(position: number, domAtPos: DomAtPos) : Node
export function flatten(node: ProseMirrorNode, descend?: boolean) : {node: ProseMirrorNode, pos: number}[]
export function findChildren(node: ProseMirrorNode, predicate: Predicate, descend?: boolean) : {node: ProseMirrorNode, pos: number}[]
export function findTextNodes(node: ProseMirrorNode, descend?: boolean) : {node: ProseMirrorNode, pos: number}[]
export function findInlineNodes(node: ProseMirrorNode, descend?: boolean) : {node: ProseMirrorNode, pos: number}[]
export function findBlockNodes(node: ProseMirrorNode, descend?: boolean) : {node: ProseMirrorNode, pos: number}[]
export function findChildrenByAttr(node: ProseMirrorNode, predicate: Predicate, descend?: boolean) : {node: ProseMirrorNode, pos: number}[]
export function findChildrenByType(node: ProseMirrorNode, nodeType: NodeType, descend?: boolean) : {node: ProseMirrorNode, pos: number}[]
export function findChildrenByMark(node: ProseMirrorNode, markType: MarkType, descend?: boolean) : {node: ProseMirrorNode, pos: number}[]
export function contains(node: ProseMirrorNode, nodeType: NodeType) : boolean
export function findTable(selection: Selection) : {pos: number, start: number, node: ProseMirrorNode} | void
export function isCellSelection(selection: Selection) : boolean
export function isColumnSelected(columnIndex: number) : (selection: Selection) => boolean
export function isRowSelected(rowIndex: number) : (selection: Selection) => boolean
export function isTableSelected(selection: Selection) : boolean
export function getCellsInColumn(columnIndex: number | number[]) : (selection: Selection) => {pos: number, start: number, node: ProseMirrorNode}[]
export function getCellsInRow(rowIndex: number | number[]) : (selection: Selection) => {pos: number, start: number, node: ProseMirrorNode}[]
export function getCellsInTable(selection: Selection) : {pos: number, start: number, node: ProseMirrorNode}[]
export function selectColumn(columnIndex: number) : (tr: Transaction) => Transaction
export function selectRow(rowIndex: number) : (tr: Transaction) => Transaction
export function selectTable(selection: Selection) : (tr: Transaction) => Transaction
export function emptyCell(cell: {pos: number, node: ProseMirrorNode}, schema: Schema) : (tr: Transaction) => Transaction
export function addColumnAt(columnIndex: number) : (tr: Transaction) => Transaction
export function addRowAt(rowIndex: number, clonePreviousRow?: boolean) : (tr: Transaction) => Transaction
export function cloneRowAt(cloneRowIndex: number) : (tr: Transaction) => Transaction
export function removeColumnAt(columnIndex: number) : (tr: Transaction) => Transaction
export function removeRowAt(rowIndex: number) : (tr: Transaction) => Transaction
export function removeTable(tr: Transaction) : Transaction
export function removeSelectedColumns(tr: Transaction) : Transaction
export function removeSelectedRows(tr: Transaction) : Transaction
export function removeColumnClosestToPos($pos: ResolvedPos) : (tr: Transaction) => Transaction
export function removeRowClosestToPos($pos: ResolvedPos) : (tr: Transaction) => Transaction
export function findCellClosestToPos($pos: ResolvedPos) : {pos: number, start: number, node: ProseMirrorNode} | void
export function findCellRectClosestToPos($pos: ResolvedPos) : {left: number, top: number, right: number, bottom: number} | void
export function forEachCellInColumn(columnIndex: number, cellTransform: CellTransform, setCursorToLastCell?: boolean) : (tr: Transaction) => Transaction
export function forEachCellInRow(rowIndex: number, cellTransform: CellTransform, setCursorToLastCell?: boolean) : (tr: Transaction) => Transaction
export function setCellAttrs(cell: {pos: number, start: number, node: ProseMirrorNode}, attrs: Object) : (tr: Transaction) => Transaction
export function createTable(schema: Schema, rowsCount?: number, colsCount?: number, withHeaderRow?: boolean, cellContent?: Node) : Node
export function getSelectionRect(selection: Selection) : {left: number, right: number, top: number, bottom: number} | void
export function getSelectionRangeInColumn(columnIndex: number) : (tr: Transaction) => {$anchor: ResolvedPos, $head: ResolvedPos, indexes: number[]}
export function getSelectionRangeInRow(rowIndex: number) : (tr: Transaction) => {$anchor: ResolvedPos, $head: ResolvedPos, indexes: number[]}
export function removeParentNodeOfType(nodeType: NodeType | NodeType[]) : (tr: Transaction) => Transaction
export function replaceParentNodeOfType(nodeType: NodeType | NodeType[], content: ProseMirrorNode | Fragment) : (tr: Transaction) => Transaction
export function removeSelectedNode(tr: Transaction) : Transaction
export function replaceSelectedNode(node: ProseMirrorNode) : (tr: Transaction) => Transaction
export function canInsert($pos: ResolvedPos, content: ProseMirrorNode | Fragment) : boolean
export function safeInsert(content: ProseMirrorNode | Fragment, position?: number) : (tr: Transaction) => Transaction
export function setParentNodeMarkup(nodeType: NodeType | NodeType[], type?: NodeType, attrs?: Object, marks?: Mark[]) : (tr: Transaction) => Transaction
export function selectParentNodeOfType(nodeType: NodeType | NodeType[]) : (tr: Transaction) => Transaction
export function removeNodeBefore(tr: Transaction) : Transaction
export function setTextSelection(position: number, dir?: number) : (tr: Transaction) => Transaction
