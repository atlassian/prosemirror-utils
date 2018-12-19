const diff = require('jest-diff');

expect.extend({
  toEqualDocument(actual, expected) {
    const pass = this.equals(actual.toJSON(), expected.toJSON());
    const message = pass
      ? () =>
          `${this.utils.matcherHint('.not.toEqualDocument')}\n\n` +
          `Expected JSON value of document to not equal:\n  ${this.utils.printExpected(
            expected
          )}\n` +
          `Actual JSON:\n  ${this.utils.printReceived(actual)}`
      : () => {
          const diffString = diff(expected, actual, {
            expand: this.expand
          });
          return (
            `${this.utils.matcherHint('.toEqualDocument')}\n\n` +
            `Expected JSON value of document to equal:\n${this.utils.printExpected(
              expected
            )}\n` +
            `Actual JSON:\n  ${this.utils.printReceived(actual)}` +
            `${diffString ? `\n\nDifference:\n\n${diffString}` : ''}`
          );
        };

    return {
      pass,
      actual,
      expected,
      message,
      name: 'toEqualDocument'
    };
  }
});
