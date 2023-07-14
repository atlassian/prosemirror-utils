import { builders } from 'prosemirror-test-builder';
import { EditorState, TextSelection, NodeSelection } from 'prosemirror-state';
import { Node as PMNode } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import schema from './schema';

type Tag = {
  cursor?: number;
  node?: number;
};
type Ref = {
  tag: Tag;
};
type DocumentTest = PMNode & Ref;
const initSelection = (
  doc: DocumentTest
): TextSelection | NodeSelection | undefined => {
  const { cursor, node } = doc.tag;

  if (node) {
    return new NodeSelection(doc.resolve(node));
  }
  if (typeof cursor === 'number') {
    return new TextSelection(doc.resolve(cursor));
  }
};

const testHelpers = builders(schema, {
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
  hr: { markType: 'rule' },
});

type EditorHelper = {
  state: EditorState;
  view: EditorView;
} & Tag;

let view: EditorView;
afterEach(() => {
  if (!view) {
    return;
  }

  view.destroy();
  const editorMount = document.querySelector('#editor-mount');
  if (editorMount && editorMount.parentNode) {
    editorMount.parentNode.removeChild(editorMount);
  }
});
const createEditor = (doc: DocumentTest): EditorHelper => {
  const editorMount = document.createElement('div');
  editorMount.setAttribute('id', 'editor-mount');

  document.body.appendChild(editorMount);
  const state = EditorState.create({
    doc,
    schema,
    selection: initSelection(doc),
  });
  view = new EditorView(editorMount, { state });

  return { state, view, ...doc.tag };
};

export { createEditor, testHelpers };
