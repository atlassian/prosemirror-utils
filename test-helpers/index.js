import { builders } from 'prosemirror-test-builder';
import { EditorState, TextSelection, NodeSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import schema from './schema';

const initSelection = doc => {
  const { cursor, node } = doc.tag;
  if (node) {
    return new NodeSelection(doc.resolve(node));
  }
  if (typeof cursor === 'number') {
    return new TextSelection(doc.resolve(cursor));
  }
};

const testHelpers = (module.exports = builders(schema, {
  doc: { nodeType: 'doc' },
  p: { nodeType: 'paragraph' },
  text: { nodeType: 'text' },
  atomInline: { nodeType: 'atomInline' },
  atomBlock: { nodeType: 'atomBlock' },
  atomContainer: { nodeType: 'atomContainer' },
  heading: { nodeType: 'heading' },
  blockquote: { nodeType: 'blockquote' },
  a: { markType: 'link', href: 'foo' },
  strong: { markType: 'strong' },
  em: { markType: 'em' },
  code: { markType: 'code' },
  code_block: { nodeType: 'code_block' },
  hr: { markType: 'rule' }
}));

testHelpers.createEditor = doc => {
  const place = document.body.appendChild(document.createElement('div'));
  const state = EditorState.create({
    doc,
    schema,
    selection: initSelection(doc)
  });
  const view = new EditorView(place, { state });

  afterEach(() => {
    view.destroy();
    if (place && place.parentNode) {
      place.parentNode.removeChild(place);
    }
  });

  return { state, view, ...doc.tag };
};
