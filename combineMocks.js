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

const combineMocks = (schema, ...mocks) => {
  const MutationTypeName = schema.getMutationType().name;

  return mocks.reduce((left, right) => {
    const {[MutationTypeName]: leftMutationType, ...leftQueryMock} = left;
    const {[MutationTypeName]: rightMutationType, ...rightQueryMock} = right;

    return {
      ...chainMerge(leftQueryMock, rightQueryMock),
      [MutationTypeName]: () => ({
        ...unwrap(leftMutationType),
        ...unwrap(rightMutationType),
      }),
    };
  }, {});
};

module.exports = combineMocks;
