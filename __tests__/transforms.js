import {
  createEditor,
  doc,
  p,
  strong,
  table,
  tr as row,
  containerWithRestrictedContent,
  td,
  th,
  tdCursor,
  tdEmpty,
  blockquote,
  atomInline,
  atomBlock
} from '../test-helpers';
import { NodeSelection } from 'prosemirror-state';
import { Fragment } from 'prosemirror-model';
import {
  removeParentNodeOfType,
  replaceParentNodeOfType,
  removeSelectedNode,
  safeInsert,
  replaceSelectedNode,
  setParentNodeMarkup,
  selectParentNodeOfType,
  removeNodeBefore,
  createTable,
  isNodeSelection
} from '../src';

describe('transforms', () => {
  describe('removeParentNodeOfType', () => {
    it('should return an original transaction if there is no parent node of a given NodeType', () => {
      const {
        state: { schema, tr }
      } = createEditor(doc(p('<cursor>')));
      const newTr = removeParentNodeOfType(schema.nodes.table)(tr);
      expect(tr).toBe(newTr);
    });
    describe('when there is a p("one") before the table node and p("two") after', () => {
      it('should remove table and preserve p("one") and p("two")', () => {
        const {
          state: { schema, tr }
        } = createEditor(doc(p('one'), table(row(tdCursor)), p('two')));
        const newTr = removeParentNodeOfType(schema.nodes.table)(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(doc(p('one'), p('two')));
      });
    });
  });

  describe('replaceParentNodeOfType', () => {
    describe('returning an original tr', () => {
      it('should return an original transaction if there is no parent node of a given NodeType', () => {
        const {
          state: { schema, tr }
        } = createEditor(doc(p('<cursor>')));
        const node = schema.nodes.paragraph.createChecked(
          {},
          schema.text('new')
        );
        const newTr = replaceParentNodeOfType(schema.nodes.table, node)(tr);
        expect(tr).toBe(newTr);
      });
      it('should return an original transaction if replacing is not possible', () => {
        const {
          state: { schema, tr }
        } = createEditor(doc(p('one'), table(row(tdCursor)), p('two')));
        const node = schema.text('new');
        const newTr = replaceParentNodeOfType(schema.nodes.table, node)(tr);
        expect(tr).toBe(newTr);
      });
    });
    describe('replacing a parent node', () => {
      it('should replace parent if array of nodeTypes is given', () => {
        const {
          state: { schema, tr }
        } = createEditor(
          doc(p('one'), blockquote(p('two<cursor>')), p('three'))
        );
        const { paragraph, blockquote: quote } = schema.nodes;
        const node = paragraph.createChecked({}, schema.text('new'));

        const newTr = replaceParentNodeOfType([quote, paragraph], node)(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(doc(p('one'), p('new'), p('three')));
      });
      describe('when there is a p("one") before the table node and p("two") after', () => {
        it('should replace table with p("new"), preserve p("one") and p("two"), and put cursor inside of the new node', () => {
          const {
            state: { schema, tr }
          } = createEditor(doc(p('one'), table(row(tdCursor)), p('two')));
          const node = schema.nodes.paragraph.createChecked(
            {},
            schema.text('new')
          );
          const newTr = replaceParentNodeOfType(schema.nodes.table, node)(tr);
          expect(newTr).not.toBe(tr);
          expect(newTr.doc).toEqualDocument(doc(p('one'), p('new'), p('two')));
          expect(newTr.selection.$from.pos).toEqual(6);
        });
      });
      describe('when there are tree paragraphs', () => {
        it('should replace the middle paragraph with p("new"), preserve p("one") and p("two"), and put cursor inside of the new node', () => {
          const {
            state: { schema, tr }
          } = createEditor(doc(p('one'), p('hello<cursor>there'), p('two')));
          const node = schema.nodes.paragraph.createChecked(
            {},
            schema.text('new')
          );
          const newTr = replaceParentNodeOfType(schema.nodes.paragraph, node)(
            tr
          );
          expect(newTr).not.toBe(tr);
          expect(newTr.doc).toEqualDocument(doc(p('one'), p('new'), p('two')));
          expect(newTr.selection.$from.pos).toEqual(6);
        });
      });
    });
    describe('composing with other tr', () => {
      it('should be composable with other transforms', () => {
        const {
          state: { schema, tr }
        } = createEditor(
          doc(p('one'), table(row(td(p('hello<cursor>there')))), p('two'))
        );
        const { paragraph, table: tableNode } = schema.nodes;
        const node = paragraph.createChecked({}, schema.text('new'));

        const newTr = replaceParentNodeOfType(tableNode, node)(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(doc(p('one'), p('new'), p('two')));

        const newTr2 = removeParentNodeOfType(paragraph)(newTr);
        expect(newTr2).not.toBe(newTr);
        expect(newTr2.doc).toEqualDocument(doc(p('one'), p('two')));
      });
    });
  });

  describe('removeSelectedNode', () => {
    it('should return an original transaction if selection is not a NodeSelection', () => {
      const {
        state: { tr }
      } = createEditor(doc(p('one')));
      const newTr = removeSelectedNode(tr);
      expect(newTr).toBe(tr);
    });

    it('should remove selected inline node', () => {
      const {
        state: { tr }
      } = createEditor(doc(p('one<node>', atomInline(), 'two')));
      const newTr = removeSelectedNode(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(doc(p('onetwo')));
    });

    it('should remove selected block node', () => {
      const { state } = createEditor(doc(p('one'), p('test'), p('two')));
      const tr = state.tr.setSelection(NodeSelection.create(state.doc, 5));
      const newTr = removeSelectedNode(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(doc(p('one'), p('two')));
    });
  });

  describe('safeInsert', () => {
    describe('inserting at the cursor position', () => {
      describe('inserting into the current node', () => {
        it('should insert an inline node into a non-empty paragraph', () => {
          const {
            state: { schema, tr }
          } = createEditor(doc(p('one<cursor>')));
          const node = schema.nodes.atomInline.createChecked();
          const newTr = safeInsert(node)(tr);
          expect(newTr).not.toBe(tr);
          expect(newTr.doc).toEqualDocument(doc(p('one', atomInline())));
        });
        it('should insert an inline node into an empty paragraph', () => {
          const {
            state: { schema, tr }
          } = createEditor(doc(p('<cursor>')));
          const node = schema.nodes.atomInline.createChecked();
          const newTr = safeInsert(node)(tr);
          expect(newTr).not.toBe(tr);
          expect(newTr.doc).toEqualDocument(doc(p(atomInline())));
        });
        it('should insert a Fragment into a non-empty paragraph', () => {
          const {
            state: { schema, tr }
          } = createEditor(doc(p('one<cursor>')));
          const node = schema.nodes.atomInline.createChecked();
          const newTr = safeInsert(Fragment.from(node))(tr);
          expect(newTr).not.toBe(tr);
          expect(newTr.doc).toEqualDocument(doc(p('one', atomInline())));
        });
        it('should insert a Fragment into an empty paragraph', () => {
          const {
            state: { schema, tr }
          } = createEditor(doc(p('<cursor>')));
          const node = schema.nodes.atomInline.createChecked();
          const newTr = safeInsert(Fragment.from(node))(tr);
          expect(newTr).not.toBe(tr);
          expect(newTr.doc).toEqualDocument(doc(p(atomInline())));
        });
      });

      describe('appending after the current node', () => {
        it('should insert a paragraph after the parent node if its not allowed and move cursor inside of the new paragraph', () => {
          const {
            state: { schema, tr }
          } = createEditor(doc(p(strong('zero'), 'o<cursor>ne'), p('three')));
          const node = schema.nodes.paragraph.createChecked(
            {},
            schema.text('two')
          );
          const newTr = safeInsert(node)(tr);
          expect(newTr).not.toBe(tr);
          expect(newTr.doc).toEqualDocument(
            doc(p(strong('zero'), 'one'), p('two'), p('three'))
          );
          expect(newTr.selection.$from.parent.textContent).toEqual('two');
        });
        it('should insert a Fragment after the parent node if its not allowed and move cursor inside of the new paragraph', () => {
          const {
            state: { schema, tr }
          } = createEditor(doc(p(strong('zero'), 'o<cursor>ne'), p('three')));
          const node = schema.nodes.paragraph.createChecked(
            {},
            schema.text('two')
          );
          const newTr = safeInsert(Fragment.from(node))(tr);
          expect(newTr).not.toBe(tr);
          expect(newTr.doc).toEqualDocument(
            doc(p(strong('zero'), 'one'), p('two'), p('three'))
          );
          expect(newTr.selection.$from.parent.textContent).toEqual('two');
        });
        it("should not split a node when it's impossible to replace it, should append instead", () => {
          const {
            state: { schema, tr }
          } = createEditor(doc(containerWithRestrictedContent(p('<cursor>'))));
          const node = schema.nodes.containerWithRestrictedContent.createChecked(
            {},
            schema.nodes.paragraph.createChecked({}, schema.text('new'))
          );
          const newTr = safeInsert(node)(tr);
          expect(newTr).not.toBe(tr);
          expect(newTr.doc).toEqualDocument(
            doc(
              containerWithRestrictedContent(p('')),
              containerWithRestrictedContent(p('new'))
            )
          );
          expect(newTr.selection.$from.parent.textContent).toEqual('new');
        });
      });
    });

    describe('When selection is a NodeSelection', () => {
      describe('when tryToReplace = true', () => {
        it('should replace selected block node with the given block node', () => {
          const { state } = createEditor(doc(atomBlock({ color: 'green' })));
          const node = state.schema.nodes.atomBlock.createChecked({
            color: 'red'
          });
          const tr = state.tr.setSelection(NodeSelection.create(state.doc, 0));
          const newTr = safeInsert(node, undefined, true)(tr);
          expect(newTr).not.toBe(tr);
          expect(newTr.doc).toEqualDocument(doc(atomBlock({ color: 'red' })));
          expect(isNodeSelection(newTr.selection)).toBe(true);
        });

        it('should replace selected inline node with the given inline node', () => {
          const { state } = createEditor(
            doc(p(atomInline({ color: 'green' })))
          );
          const node = state.schema.nodes.atomInline.createChecked({
            color: 'red'
          });
          const tr = state.tr.setSelection(NodeSelection.create(state.doc, 1));
          const newTr = safeInsert(node, undefined, true)(tr);
          expect(newTr).not.toBe(tr);
          expect(newTr.doc).toEqualDocument(
            doc(p(atomInline({ color: 'red' })))
          );
          expect(isNodeSelection(newTr.selection)).toBe(true);
        });
      });

      describe('when tryToReplace = false', () => {
        it('should append a node', () => {
          const { state } = createEditor(
            doc(table(row(td(atomBlock({ color: 'green' })))))
          );
          const tr = state.tr.setSelection(NodeSelection.create(state.doc, 3));
          const node = state.schema.nodes.atomBlock.createChecked({
            color: 'red'
          });
          const newTr = safeInsert(node)(tr);
          expect(newTr).not.toBe(tr);
          expect(newTr.doc).toEqualDocument(
            doc(
              table(
                row(
                  td(atomBlock({ color: 'green' }), atomBlock({ color: 'red' }))
                )
              )
            )
          );
          expect(isNodeSelection(newTr.selection)).toBe(true);
        });
      });
    });

    describe('replacing an empty parent paragraph', () => {
      it('should replace an empty parent paragraph with the given node', () => {
        const {
          state: { schema, tr }
        } = createEditor(doc(p('one'), p('<cursor>'), p('three')));
        const node = schema.nodes.blockquote.createChecked(
          {},
          schema.nodes.paragraph.createChecked({}, schema.text('two'))
        );
        const newTr = safeInsert(Fragment.from(node))(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(
          doc(p('one'), blockquote(p('two')), p('three'))
        );
        expect(newTr.selection.$from.parent.textContent).toEqual('two');
      });
      it("should replace an empty paragraph inside other node if it's allowed by schema", () => {
        const {
          state: { schema, tr }
        } = createEditor(doc(table(row(td(p('<cursor>'))))));
        const node = schema.nodes.blockquote.createChecked(
          {},
          schema.nodes.paragraph.createChecked({}, schema.text('two'))
        );
        const newTr = safeInsert(node)(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(
          doc(table(row(td(blockquote(p('two'))))))
        );
        expect(newTr.selection.$from.parent.textContent).toEqual('two');
      });
      describe('when inserting a selectable atom node', () => {
        it('should replace a parent if its the only node in the doc and retain the node selection', () => {
          const {
            state: { schema, tr }
          } = createEditor(doc(p('<cursor>')));
          const node = schema.nodes.atomBlock.createChecked({
            color: 'yellow'
          });
          const newTr = safeInsert(node)(tr);
          expect(newTr).not.toBe(tr);
          expect(newTr.doc).toEqualDocument(
            doc(atomBlock({ color: 'yellow' }))
          );
          expect(isNodeSelection(newTr.selection)).toBe(true);
        });
      });
    });

    describe('inserting at given position', () => {
      it('should insert a node at position 0 (start of the doc) and move cursor inside of the new paragraph', () => {
        const {
          state: { schema, tr }
        } = createEditor(doc(p('one'), p('two<cursor>')));
        const node = schema.nodes.paragraph.createChecked(
          {},
          schema.text('new')
        );
        const newTr = safeInsert(node, 0)(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(doc(p('new'), p('one'), p('two')));
        expect(newTr.selection.$from.parent.textContent).toEqual('new');
        expect(!!newTr.selection.$cursor).toBe(true);
      });
      it('should insert a Fragment at position 0 (start of the doc) and move cursor inside of the new paragraph', () => {
        const {
          state: { schema, tr }
        } = createEditor(doc(p('one'), p('two<cursor>')));
        const node = schema.nodes.paragraph.createChecked(
          {},
          schema.text('new')
        );
        const newTr = safeInsert(Fragment.from(node), 0)(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(doc(p('new'), p('one'), p('two')));
        expect(newTr.selection.$from.parent.textContent).toEqual('new');
        expect(!!newTr.selection.$cursor).toBe(true);
      });
      it('should insert a node at position 1 and move cursor inside of the new paragraph', () => {
        const {
          state: { schema, tr }
        } = createEditor(doc(p('one'), p('two<cursor>')));
        const node = schema.nodes.paragraph.createChecked(
          {},
          schema.text('new')
        );
        const newTr = safeInsert(node, 1)(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(doc(p('one'), p('new'), p('two')));
        expect(newTr.selection.$from.parent.textContent).toEqual('new');
        expect(!!newTr.selection.$cursor).toBe(true);
      });
      it('should insert a node at position in between two nodes and move cursor inside of the new paragraph', () => {
        const {
          state: { schema, tr }
        } = createEditor(doc(p('one'), p('two<cursor>')));
        const node = schema.nodes.paragraph.createChecked(
          {},
          schema.text('new')
        );
        const newTr = safeInsert(node, 5)(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(doc(p('one'), p('new'), p('two')));
        expect(newTr.selection.$from.parent.textContent).toEqual('new');
        expect(!!newTr.selection.$cursor).toBe(true);
      });
    });

    describe('setting selection after insertion', () => {
      it('should set the selection after the inserted content (text)', () => {
        const {
          state: { schema, tr }
        } = createEditor(doc(p('<cursor>')));
        const newTr = safeInsert(Fragment.from(schema.text('new')))(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(doc(p('new')));
        expect(newTr.selection.head).toEqual(4);
        expect(!!newTr.selection.$cursor).toBe(true);
      });
      it('should move cursor to the inserted paragraph', () => {
        const {
          state: { schema, tr }
        } = createEditor(doc(p('ol<cursor>d')));
        const node = schema.nodes.paragraph.createChecked(
          {},
          schema.text('new')
        );
        const newTr = safeInsert(node)(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(doc(p('old'), p('new')));
        expect(newTr.selection.head).toEqual(6);
        expect(!!newTr.selection.$cursor).toBe(true);
      });
      it('should move cursor to the first cell of the inserted table', () => {
        const {
          state: { schema, tr }
        } = createEditor(doc(p('tex<cursor>t')));
        const node = createTable(schema);
        const newTr = safeInsert(node)(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(
          doc(
            p('text'),
            table(
              row(th(p('')), th(p('')), th(p(''))),
              row(td(p('')), td(p('')), td(p(''))),
              row(td(p('')), td(p('')), td(p('')))
            )
          )
        );
        expect(newTr.selection.head).toEqual(10);
        expect(!!newTr.selection.$cursor).toBe(true);
      });

      it('should set NodeSelection when the node is selectable and inserted after the current node', () => {
        const {
          state: { tr, schema }
        } = createEditor(doc(p('tex<cursor>t')));
        const node = schema.nodes.atomBlock.createChecked({
          color: 'red'
        });
        const newTr = safeInsert(node)(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(
          doc(p('tex<cursor>t'), atomBlock({ color: 'red' }))
        );
        expect(isNodeSelection(newTr.selection)).toBe(true);
      });

      it('should set NodeSelection when the node is selectable and empty paragraph is replaced', () => {
        const {
          state: { tr, schema }
        } = createEditor(doc(p('<cursor>')));
        const node = schema.nodes.atomBlock.createChecked({
          color: 'red'
        });
        const newTr = safeInsert(node)(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(doc(atomBlock({ color: 'red' })));
        expect(isNodeSelection(newTr.selection)).toBe(true);
      });

      it('should set NodeSelection when the node is selectable and inserted at the given position', () => {
        const {
          state: { tr, schema }
        } = createEditor(doc(p('<cursor>')));
        const node = schema.nodes.atomInline.createChecked({
          color: 'red'
        });
        const newTr = safeInsert(node)(tr);
        expect(newTr).not.toBe(tr);
        expect(newTr.doc).toEqualDocument(doc(p(atomInline({ color: 'red' }))));
        expect(isNodeSelection(newTr.selection)).toBe(true);
      });
    });
  });

  describe('replaceSelectedNode', () => {
    it('should return an original transaction if current selection is not a NodeSelection', () => {
      const {
        state: { schema, tr }
      } = createEditor(doc(p('<cursor>')));
      const node = schema.nodes.paragraph.createChecked({}, schema.text('new'));
      const newTr = replaceSelectedNode(node)(tr);
      expect(tr).toBe(newTr);
    });
    it('should return an original transaction if replacing is not possible', () => {
      const { state } = createEditor(doc(p('one')));
      const tr = state.tr.setSelection(NodeSelection.create(state.doc, 0));
      const node = state.schema.text('new');
      const newTr = replaceSelectedNode(node)(tr);
      expect(tr).toBe(newTr);
    });

    it('should replace selected node with the given `node`', () => {
      const { state } = createEditor(doc(p('one'), p('test'), p('two')));
      const tr = state.tr.setSelection(NodeSelection.create(state.doc, 5));
      const node = state.schema.nodes.paragraph.createChecked(
        {},
        state.schema.text('new')
      );
      const newTr = replaceSelectedNode(node)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(doc(p('one'), p('new'), p('two')));
    });

    it('should replace selected node with the given `fragment`', () => {
      const { state } = createEditor(doc(p('one'), p('test'), p('two')));
      const tr = state.tr.setSelection(NodeSelection.create(state.doc, 5));
      const fragment = Fragment.fromArray([
        state.schema.nodes.paragraph.createChecked(
          {},
          state.schema.text('new')
        ),
        state.schema.nodes.paragraph.createChecked(
          {},
          state.schema.text('paragraphs')
        )
      ]);
      const newTr = replaceSelectedNode(fragment)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(
        doc(p('one'), p('new'), p('paragraphs'), p('two'))
      );
    });
  });

  describe('setParentNodeMarkup', () => {
    it('should return an original transaction if there is not parent node of a given nodeType', () => {
      const {
        state: { schema, tr }
      } = createEditor(doc(p('<cursor>')));
      const newTr = setParentNodeMarkup(
        schema.nodes.blockquote,
        schema.nodes.paragraph
      )(tr);
      expect(tr).toBe(newTr);
    });

    it('should update nodeType', () => {
      const {
        state: { schema, tr }
      } = createEditor(doc(table(row(td(p('text<cursor>'))))));
      const newTr = setParentNodeMarkup(
        schema.nodes.table_cell,
        schema.nodes.table_header
      )(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(doc(table(row(th(p('text'))))));
    });

    it('should update attributes', () => {
      const { state } = createEditor(doc(table(row(td(p('text<cursor>'))))));
      const {
        schema: {
          nodes: { table_cell }
        }
      } = state;
      const newTr = setParentNodeMarkup(table_cell, null, {
        colspan: 5,
        rowspan: 7
      })(state.tr);
      expect(newTr).not.toBe(state.tr);
      newTr.doc.content.descendants(child => {
        if (child.type === table_cell) {
          expect(child.attrs).toEqual({
            colspan: 5,
            rowspan: 7,
            colwidth: null,
            pretty: true,
            ugly: false
          });
        }
      });
    });
  });

  describe('selectParentNodeOfType', () => {
    it('should return an original transaction if current selection is a NodeSelection', () => {
      const { state } = createEditor(doc(p('one')));
      const tr = state.tr.setSelection(NodeSelection.create(state.doc, 1));
      const newTr = selectParentNodeOfType(state.schema.nodes.paragraph)(tr);
      expect(tr).toBe(newTr);
    });
    it('should return an original transaction if there is no parent node of a given `nodeType`', () => {
      const {
        state: { tr, schema }
      } = createEditor(doc(p('one')));
      const newTr = selectParentNodeOfType(schema.nodes.table)(tr);
      expect(tr).toBe(newTr);
    });
    it('should return a new transaction that selects a parent node of a given `nodeType`', () => {
      const {
        state: { tr, schema }
      } = createEditor(doc(p('one')));
      const newTr = selectParentNodeOfType(schema.nodes.paragraph)(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.selection.node.type.name).toEqual('paragraph');
    });
    it('should return a new transaction that selects a parent node of a given `nodeType`, if `nodeType` an array', () => {
      const {
        state: {
          tr,
          schema: {
            nodes: { paragraph, table }
          }
        }
      } = createEditor(doc(p('one')));
      const newTr = selectParentNodeOfType([table, paragraph])(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.selection.node.type.name).toEqual('paragraph');
    });
  });

  describe('removeNodeBefore', () => {
    it('should return an original transaction if there is no nodeBefore', () => {
      const {
        state: { tr }
      } = createEditor(doc(p('<cursor>')));
      const newTr = removeNodeBefore(tr);
      expect(tr).toBe(newTr);
    });
    it('should a new transaction that removes nodeBefore if its a table', () => {
      const {
        state: { tr }
      } = createEditor(
        doc(p('one'), table(row(tdEmpty), row(tdEmpty)), '<cursor>', p('two'))
      );
      const newTr = removeNodeBefore(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(doc(p('one'), p('two')));
    });
    it('should a new transaction that removes nodeBefore if its a blockquote', () => {
      const {
        state: { tr }
      } = createEditor(doc(p('one'), blockquote(p('')), '<cursor>', p('two')));
      const newTr = removeNodeBefore(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(doc(p('one'), p('two')));
    });
    it('should a new transaction that removes nodeBefore if its a leaf node', () => {
      const {
        state: { tr }
      } = createEditor(doc(p('one'), atomBlock(), '<cursor>', p('two')));
      const newTr = removeNodeBefore(tr);
      expect(newTr).not.toBe(tr);
      expect(newTr.doc).toEqualDocument(doc(p('one'), p('two')));
    });
  });
});
