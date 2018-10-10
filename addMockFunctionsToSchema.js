const {forEachField, addMockFunctionsToSchema: addMocks} = require('graphql-tools');
const compose = require('./compose');
const combineMocks = require('./combineMocks');
const {store} = require('./store');

const addToContext = options => resolver => (root, args, context = {}, info) => {
  const extendedContext = Object.assign(
    Object.create(Object.getPrototypeOf(context)),
    context,
    options
  );
  return resolver(root, args, extendedContext, info);
};

const addMockFunctionsToSchema = ({schema, mocks: mocksIn = {}, preserveResolvers = false}) => {
  const mocks = Array.isArray(mocksIn) ? combineMocks(...mocksIn) : mocksIn;

  addMocks({schema, mocks, preserveResolvers});

  const {clear, find, reset, track} = store(schema);

  const MutationTypeName = schema.getMutationType().name;

  forEachField(schema, (field, typeName) => {
    const wrappers = [addToContext({clear, find, reset})];

    if (typeName !== MutationTypeName) {
      wrappers.unshift(track);
    }

    field.resolve = compose(...wrappers)(field.resolve);
  });
};

module.exports = addMockFunctionsToSchema;
