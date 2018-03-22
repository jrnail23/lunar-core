const unwrap = fn => (fn ? fn() : {});
const combineMocks = (schema, ...mocks) => {
  const MutationTypeName = schema.getMutationType().name;
  return mocks.reduce(
    (left, right) => ({
      ...left,
      ...right,
      [MutationTypeName]: () => ({
        ...unwrap(left[MutationTypeName]),
        ...unwrap(right[MutationTypeName])
      })
    }),
    {}
  );
};

module.exports = combineMocks;
