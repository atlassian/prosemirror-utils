import { Schema } from 'prosemirror-model';
import { nodes, marks } from 'prosemirror-schema-basic';
import { tableNodes } from 'prosemirror-tables';

const { doc, paragraph, text, horizontal_rule: rule, blockquote } = nodes;
const { table, table_cell, table_header, table_row } = tableNodes({
  tableGroup: 'block',
  cellContent: 'block+',
  cellAttributes: {
    pretty: { default: true },
    ugly: { default: false },
    background: { default: false }
  }
});

const atomInline = {
  inline: true,
  group: 'inline',
  atom: true,
  attrs: {
    color: { default: null }
  },
  selectable: true,
  parseDOM: [
    {
      tag: 'span[data-node-type="atomInline"]',
      getAttrs: dom => {
        return {
          color: dom.getAttribute('data-color')
        };
      }
    }
  ],
  toDOM(node) {
    const { color } = node.attrs;
    const attrs = {
      'data-node-type': 'atomInline',
      'data-color': color
    };
    return ['span', attrs];
  }
};

const atomBlock = {
  inline: false,
  group: 'block',
  atom: true,
  attrs: {
    color: { default: null }
  },
  selectable: true,
  parseDOM: [
    {
      tag: 'div[data-node-type="atomBlock"]',
      getAttrs: dom => {
        return {
          color: dom.getAttribute('data-color')
        };
      }
    }
  ],
  toDOM(node) {
    const { color } = node.attrs;
    const attrs = {
      'data-node-type': 'atomBlock',
      'data-color': color
    };
    return ['div', attrs];
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

const containerWithRestrictedContent = {
  inline: false,
  group: 'block',
  content: 'paragraph+',
  parseDOM: [
    {
      tag: 'div[data-node-type="containerWithRestrictedContent"]'
    }
  ],
  toDOM() {
    return ['div', { 'data-node-type': 'containerWithRestrictedContent' }];
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
    containerWithRestrictedContent,
    table,
    table_row,
    table_cell,
    table_header,
    blockquote
  },
  marks
});
