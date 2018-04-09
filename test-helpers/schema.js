import { Schema } from 'prosemirror-model';
import { nodes, marks } from 'prosemirror-schema-basic';
import { tableNodes } from 'prosemirror-tables';

const { doc, paragraph, text, horizontal_rule: rule, blockquote } = nodes;
const { table, table_cell, table_header, table_row } = tableNodes({
  tableGroup: 'block',
  cellContent: 'block+',
  cellAttributes: {
    pretty: { default: true },
    ugly: { default: false }
  }
});

const atom = {
  inline: true,
  group: 'inline',
  atom: true,
  selectable: false,
  parseDOM: [
    {
      tag: 'span[data-node-type="atom"]'
    }
  ],
  toDOM() {
    return ['span', { 'data-node-type': 'atom' }];
  }
};

const atomBlock = {
  inline: false,
  group: 'block',
  atom: true,
  selectable: true,
  parseDOM: [
    {
      tag: 'div[data-node-type="atomBlock"]'
    }
  ],
  toDOM() {
    return ['div', { 'data-node-type': 'atomBlock' }];
  }
};

export default new Schema({
  nodes: {
    doc,
    paragraph,
    text,
    atom,
    atomBlock,
    table,
    table_row,
    table_cell,
    table_header,
    blockquote
  },
  marks
});
