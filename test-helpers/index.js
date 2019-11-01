import { builders } from 'prosemirror-test-builder';
import { EditorState, TextSelection, NodeSelection } from 'prosemirror-state';
import { cellAround, CellSelection } from 'prosemirror-tables';
import { EditorView } from 'prosemirror-view';
import schema from './schema';

const resolveCell = (doc, tag) => {
  if (!tag) {
    return null;
  }
  return cellAround(doc.resolve(tag));
};

const initSelection = doc => {
  const { cursor, node, start, end } = doc.tag;
  if (node) {
    return new NodeSelection(doc.resolve(node));
  }
  if (typeof cursor === 'number') {
    return new TextSelection(doc.resolve(cursor));
  }
  if (typeof start === 'number' && typeof end === 'number') {
    return new TextSelection(doc.resolve(start), doc.resolve(end));
  }
  const $anchor = resolveCell(doc, doc.tag.anchor);
  if ($anchor) {
    return new CellSelection(
      $anchor,
      resolveCell(doc, doc.tag.head) || undefined
    );
  }
};

const testHelpers = (module.exports = builders(schema, {
  doc: { nodeType: 'doc' },
  p: { nodeType: 'paragraph' },
  text: { nodeType: 'text' },
  atomInline: { nodeType: 'atomInline' },
  atomBlock: { nodeType: 'atomBlock' },
  atomContainer: { nodeType: 'atomContainer' },
  table: { nodeType: 'table' },
  tr: { nodeType: 'table_row' },
  td: { nodeType: 'table_cell' },
  th: { nodeType: 'table_header' },
  blockquote: { nodeType: 'blockquote' },
  a: { markType: 'link', href: 'foo' },
  strong: { markType: 'strong' },
  em: { markType: 'em' },
  code: { markType: 'code' }
}));

const { td, th, p } = testHelpers;

testHelpers.tdEmpty = td(p());
testHelpers.thEmpty = th(p());
testHelpers.tdCursor = td(p('<cursor>'));
testHelpers.thCursor = th(p('<cursor>'));

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
