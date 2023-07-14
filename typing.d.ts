/* eslint-disable  @typescript-eslint/no-unused-vars */
export {};

declare global {
  namespace jest {

    interface Matchers<R> {
      toEqualDocument(expected: unknown): CustomMatcherResult;
    }
  }
}
