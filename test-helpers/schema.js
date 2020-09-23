import { Schema } from 'prosemirror-model';
import { nodes, marks } from 'prosemirror-schema-basic';

const {
  doc,
  paragraph,
  text,
  horizontal_rule: rule,
  blockquote,
  heading,
  code_block
} = nodes;

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
    heading,
    paragraph,
    text,
    atomInline,
    atomBlock,
    atomContainer,
    containerWithRestrictedContent,
    blockquote,
    rule,
    code_block
  },
  marks
});
