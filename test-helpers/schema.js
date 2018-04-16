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

const atomInline = {
  inline: true,
  group: 'inline',
  atom: true,
  selectable: true,
  parseDOM: [
    {
      tag: 'span[data-node-type="atomInline"]'
    }
  ],
  toDOM() {
    return ['span', { 'data-node-type': 'atomInline' }];
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

const atomContainer = {
  inline: false,
  group: 'block',
  content: 'atomBlock',
  parseDOM: [
    {
      tag: 'div[data-node-type="atomBlockContainer"]'
    }
  ],
  toDOM() {
    return ['div', { 'data-node-type': 'atomBlockContainer' }];
  }
};

export default new Schema({
  nodes: {
    doc,
    paragraph,
    text,
    atomInline,
    atomBlock,
    atomContainer,
    table,
    table_row,
    table_cell,
    table_header,
    blockquote
  },
  marks
});
