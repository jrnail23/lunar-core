const unwrap = fn => (fn ? fn() : {});

const chainMerge = (left, right) =>
  Object.entries(right).reduce(
    (merged, [key, rightFn]) => {
      const mergedFn = key in merged ? mergeFns(merged[key], rightFn) : rightFn;
      return Object.assign(merged, {[key]: mergedFn});
    },
    {...left}
  );

const mergeFns = (leftFn, rightFn) => (...args) => {
  const rightValue = rightFn(...args);
  if (rightValue === null) return rightValue;
  return Object.assign(leftFn(...args), rightValue);
};

const combineMocks = (...mocks) => {
  return mocks.reduce((left, right) => {
    const {Mutation: leftMutationType, ...leftQueryMock} = left;
    const {Mutation: rightMutationType, ...rightQueryMock} = right;

    return {
      ...chainMerge(leftQueryMock, rightQueryMock),
      Mutation: () => ({
        ...unwrap(leftMutationType),
        ...unwrap(rightMutationType),
      }),
    };
  }, {});
};

module.exports = combineMocks;
