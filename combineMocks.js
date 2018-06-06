const unwrap = fn => (fn ? fn() : {});

const smartMergeQueryMocks = (left, right) => {
  const leftAndRight = {...left};

  Object.keys(right).forEach(key => {
    if (key in left) {
      if (Array.isArray(left[key])) {
        leftAndRight[key].push(right[key]);
      } else {
        leftAndRight[key] = [left[key], right[key]];
      }
    } else {
      leftAndRight[key] = right[key];
    }
  });

  return leftAndRight;
};

const chainMockExecution = mocks => {
  const chainedMocks = {};

  Object.keys(mocks).forEach(k => {
    if (Array.isArray(mocks[k])) {
      const funcArray = mocks[k];
      const wrapperFunction = function() {
        return funcArray.reduce((obj, func) => {
          const funcResult = func.apply(null, arguments);
          return Object.assign(obj, funcResult);
        }, {});
      };
      chainedMocks[k] = wrapperFunction;
    } else {
      chainedMocks[k] = mocks[k];
    }
  });

  return chainedMocks;
};

const combineMocks = (schema, ...mocks) => {
  const MutationTypeName = schema.getMutationType().name;

  const mergedMocks = mocks.reduce((left, right) => {
    const {[MutationTypeName]: leftMutationType, ...leftQueryMock} = left;
    const {[MutationTypeName]: rightMutationType, ...rightQueryMock} = right;

    return {
      ...smartMergeQueryMocks(leftQueryMock, rightQueryMock),
      [MutationTypeName]: () => ({
        ...unwrap(leftMutationType),
        ...unwrap(rightMutationType),
      }),
    };
  }, {});
  return chainMockExecution(mergedMocks);
};

module.exports = combineMocks;
