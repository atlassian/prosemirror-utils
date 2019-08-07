import { NodeSelection } from 'prosemirror-state';
import { Fragment, Node as PMNode } from 'prosemirror-model';
import { TableMap } from 'prosemirror-tables';

// :: (selection: Selection) → boolean
// Checks if current selection is a `NodeSelection`.
//
// ```javascript
// if (isNodeSelection(tr.selection)) {
//   // ...
// }
// ```
export const isNodeSelection = selection => {
  return selection instanceof NodeSelection;
};

// (nodeType: union<NodeType, [NodeType]>) → boolean
// Checks if the type a given `node` equals to a given `nodeType`.
export const equalNodeType = (nodeType, node) => {
  return (
    (Array.isArray(nodeType) && nodeType.indexOf(node.type) > -1) ||
    node.type === nodeType
  );
};

// (tr: Transaction) → Transaction
// Creates a new transaction object from a given transaction
export const cloneTr = tr => {
  return Object.assign(Object.create(tr), tr).setTime(Date.now());
};

// ($pos: ResolvedPos, doc: ProseMirrorNode, content: union<ProseMirrorNode, Fragment>, ) → boolean
// Checks if replacing a node at a given `$pos` inside of the `doc` node with the given `content` is possible.
export const canReplace = ($pos, content) => {
  const node = $pos.node($pos.depth);
  return (
    node &&
    node.type.validContent(
      content instanceof Fragment ? content : Fragment.from(content)
    )
  );
};

// (position: number) → (tr: Transaction) → Transaction
// Returns a `delete` transaction that removes a node at a given position with the given `node`.
// `position` should point at the position immediately before the node.
export const removeNodeAtPos = position => tr => {
  const node = tr.doc.nodeAt(position);
  return cloneTr(tr.delete(position, position + node.nodeSize));
};

// (schema: Schema) → {[key: string]: NodeType}
// Returns a map where keys are tableRoles and values are NodeTypes.
export const tableNodeTypes = schema => {
  if (schema.cached.tableNodeTypes) {
    return schema.cached.tableNodeTypes;
  }
  const roles = {};
  Object.keys(schema.nodes).forEach(type => {
    const nodeType = schema.nodes[type];
    if (nodeType.spec.tableRole) {
      roles[nodeType.spec.tableRole] = nodeType;
    }
  });
  schema.cached.tableNodeTypes = roles;
  return roles;
};

// :: ($pos: ResolvedPos, content: union<ProseMirrorNode, Fragment>) → boolean
// Checks if a given `content` can be inserted at the given `$pos`
//
// ```javascript
// const { selection: { $from } } = state;
// const node = state.schema.nodes.atom.createChecked();
// if (canInsert($from, node)) {
//   // ...
// }
// ```
export const canInsert = ($pos, content) => {
  const index = $pos.index();

  if (content instanceof Fragment) {
    return $pos.parent.canReplace(index, index, content);
  } else if (content instanceof PMNode) {
    return $pos.parent.canReplaceWith(index, index, content.type);
  }
  return false;
};

// (node: ProseMirrorNode) → boolean
// Checks if a given `node` is an empty paragraph
export const isEmptyParagraph = node => {
  return !node || (node.type.name === 'paragraph' && node.nodeSize === 2);
};

export const createCell = (cellType, cellContent = null) => {
  if (cellContent) {
    return cellType.createChecked(null, cellContent);
  }

  return cellType.createAndFill();
};

// (rect: {left: number, right: number, top: number, bottom: number}) → (selection: Selection) → boolean
// Checks if a given CellSelection rect is selected
export const isRectSelected = rect => selection => {
  const map = TableMap.get(selection.$anchorCell.node(-1));
  const start = selection.$anchorCell.start(-1);
  const cells = map.cellsInRect(rect);
  const selectedCells = map.cellsInRect(
    map.rectBetween(
      selection.$anchorCell.pos - start,
      selection.$headCell.pos - start
    )
  );

  for (let i = 0, count = cells.length; i < count; i++) {
    if (selectedCells.indexOf(cells[i]) === -1) {
      return false;
    }
  }

  return true;
};

// This function transposes an array of array flipping the columns for rows,
// transposition is a familiar algebra concept;
// you can get more details here:
// https://en.wikipedia.org/wiki/Transpose
//
// ```javascript
//
//  const arr = [
//    ['a1', 'a2', 'a3'],
//    ['b1', 'b2', 'b3'],
//    ['c1', 'c2', 'c3'],
//    ['d1', 'd2', 'd3'],
//  ];
//
//  const result = transpose(arr);
//
//  result === [
//    ['a1', 'b1', 'c1', 'd1'],
//    ['a2', 'b2', 'c2', 'd2'],
//    ['a3', 'b3', 'c3', 'd3'],
//  ]
// ```
export const transpose = array => {
  return array[0].map((_, i) => {
    return array.map(column => column[i]);
  });
};

// :: (tableNode: Node) -> Array<Node>
// This function will transform the table node
// into a matrix of rows and columns respecting merged cells,
// for example this table will be convert to the below:
//
// ```
//  ____________________________
// |      |      |             |
// |  A1  |  B1  |     C1      |
// |______|______|______ ______|
// |      |             |      |
// |  A2  |     B2      |      |
// |______|______ ______|      |
// |      |      |      |  D1  |
// |  A3  |  B3  |  C2  |      |
// |______|______|______|______|
// ```
//
//
// ```javascript
// array = [
//   [A1, B1, C1, null],
//   [A2, B2, null, D1],
//   [A3. B3, C2, null],
// ]
// ```
export const convertTableNodeToArrayOfRows = tableNode => {
  const map = TableMap.get(tableNode);
  const rows = [];
  for (let rowIndex = 0; rowIndex < map.height; rowIndex++) {
    const rowCells = [];
    const seen = {};

    for (let colIndex = 0; colIndex < map.width; colIndex++) {
      const cellPos = map.map[rowIndex * map.width + colIndex];
      const cell = tableNode.nodeAt(cellPos);
      const rect = map.findCell(cellPos);
      if (seen[cellPos] || rect.top !== rowIndex) {
        rowCells.push(null);
        continue;
      }
      seen[cellPos] = true;

      rowCells.push(cell);
    }

    rows.push(rowCells);
  }

  return rows;
};

// :: (tableNode: Node, tableArray: Array<Node>) -> Node
// This function will transform a matrix of nodes
// into table node respecting merged cells and rows configurations,
// for example this array will be convert to the table below:
//
// ```javascript
// array = [
//   [A1, B1, C1, null],
//   [A2, B2, null, D1],
//   [A3. B3, C2, null],
// ]
// ```
//
// ```
//  ____________________________
// |      |      |             |
// |  A1  |  B1  |     C1      |
// |______|______|______ ______|
// |      |             |      |
// |  A2  |     B2      |      |
// |______|______ ______|      |
// |      |      |      |  D1  |
// |  A3  |  B3  |  C2  |      |
// |______|______|______|______|
// ```
//
export const convertArrayOfRowsToTableNode = (tableNode, arrayOfNodes) => {
  const rowsPM = [];
  const map = TableMap.get(tableNode);
  for (let rowIndex = 0; rowIndex < map.height; rowIndex++) {
    const row = tableNode.child(rowIndex);
    const rowCells = [];

    for (let colIndex = 0; colIndex < map.width; colIndex++) {
      if (!arrayOfNodes[rowIndex][colIndex]) {
        continue;
      }
      const cellPos = map.map[rowIndex * map.width + colIndex];

      const cell = arrayOfNodes[rowIndex][colIndex];
      const oldCell = tableNode.nodeAt(cellPos);
      const newCell = oldCell.type.createChecked(
        Object.assign({}, cell.attrs),
        cell.content,
        cell.marks
      );
      rowCells.push(newCell);
    }

    rowsPM.push(row.type.createChecked(row.attrs, rowCells, row.marks));
  }

  const newTable = tableNode.type.createChecked(
    tableNode.attrs,
    rowsPM,
    tableNode.marks
  );

  return newTable;
};

export const moveTableColumn = (
  table,
  indexesOrigin,
  indexesTarget,
  direction
) => {
  let rows = transpose(convertTableNodeToArrayOfRows(table.node));

  rows = moveRowInArrayOfRows(rows, indexesOrigin, indexesTarget, direction);
  rows = transpose(rows);

  return convertArrayOfRowsToTableNode(table.node, rows);
};

export const moveTableRow = (
  table,
  indexesOrigin,
  indexesTarget,
  direction
) => {
  let rows = convertTableNodeToArrayOfRows(table.node);

  rows = moveRowInArrayOfRows(rows, indexesOrigin, indexesTarget, direction);

  return convertArrayOfRowsToTableNode(table.node, rows);
};

const moveRowInArrayOfRows = (
  rows,
  indexesOrigin,
  indexesTarget,
  directionOverride
) => {
  let direction = indexesOrigin[0] > indexesTarget[0] ? -1 : 1;

  const rowsExtracted = rows.splice(indexesOrigin[0], indexesOrigin.length);
  const positionOffset = rowsExtracted.length % 2 === 0 ? 1 : 0;
  let target;

  if (directionOverride === -1 && direction === 1) {
    target = indexesTarget[0] - 1;
  } else if (directionOverride === 1 && direction === -1) {
    target = indexesTarget[indexesTarget.length - 1] - positionOffset + 1;
  } else {
    target =
      direction === -1
        ? indexesTarget[0]
        : indexesTarget[indexesTarget.length - 1] - positionOffset;
  }

  rows.splice.apply(rows, [target, 0].concat(rowsExtracted));
  return rows;
};

export const checkInvalidMovements = (
  originIndex,
  targetIndex,
  targets,
  type
) => {
  const direction = originIndex > targetIndex ? -1 : 1;
  const errorMessage = `Target position is invalid, you can't move the ${type} ${originIndex} to ${targetIndex}, the target can't be split. You could use tryToFit option.`;

  if (direction === 1) {
    if (targets.slice(0, targets.length - 1).indexOf(targetIndex) !== -1) {
      throw new Error(errorMessage);
    }
  } else {
    if (targets.slice(1).indexOf(targetIndex) !== -1) {
      throw new Error(errorMessage);
    }
  }

  return true;
};
