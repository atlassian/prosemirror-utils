import { Schema } from "prosemirror-model";
import { nodes, marks } from "prosemirror-schema-basic";
import { tableNodes } from "prosemirror-tables";

const { doc, paragraph, text, horizontal_rule: rule, blockquote } = nodes;
const { table, table_cell, table_header, table_row } = tableNodes({
  tableGroup: "block",
  cellContent: "block+",
  cellAttributes: {
    pretty: { default: true },
    ugly: { default: false }
  }
});

const atom = {
  inline: true,
  group: "inline",
  selectable: false,
  parseDOM: [
    {
      tag: 'span[data-node-type="atom"]'
    }
  ],
  toDOM() {
    return ["span", { "data-node-type": "atom" }];
  }
};

export default new Schema({
  nodes: {
    doc,
    paragraph,
    text,
    atom,
    table,
    table_row,
    table_cell,
    table_header,
    blockquote
  },
  marks
});
