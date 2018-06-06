const unwrap = fn => (fn ? fn() : {});

const chainMerge = (left, right) => {
  const leftAndRight = {...left};

  Object.keys(right).forEach(key => {
    if (key in left) {
      leftAndRight[key] = function() {
        const rightObj = right[key].apply(null, arguments);

        if (rightObj === null) {
          return null;
        }

        return {
          ...left[key].apply(null, arguments),
          ...rightObj,
        };
      };
    } else {
      leftAndRight[key] = right[key];
    }
  });

  return leftAndRight;
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
