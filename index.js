const { defaultFieldResolver } = require('graphql');
const { forEachField, addMockFunctionsToSchema } = require('graphql-tools');
const { store } = require('./store');
const combineMocks = require('./combineMocks');
const compose = require('./compose');

const addToContext = options => resolver => (
  root,
  args,
  context = {},
  info
) => {
  const extendedContext = Object.assign(
    Object.create(Object.getPrototypeOf(context)),
    context,
    options
  );
  return resolver(root, args, extendedContext, info);
};

exports.addMockFunctionsToSchema = ({
  schema,
  mocks: mocksIn = {},
  preserveResolvers = false
}) => {
  const mocks = Array.isArray(mocksIn)
    ? combineMocks(schema, ...mocksIn)
    : mocksIn;

  addMockFunctionsToSchema({ schema, mocks, preserveResolvers });

  const { clear, find, reset, track } = store(schema);

  const MutationTypeName = schema.getMutationType().name;

  forEachField(schema, (field, typeName) => {
    const wrappers = [addToContext({ clear, find, reset })];

    if (typeName !== MutationTypeName) {
      wrappers.unshift(track);
    }

    field.resolve = compose(...wrappers)(field.resolve);
  });
};

exports.removeMockFunctionsFromSchema = ({ schema }) => {
  const { reset } = store(schema);

  reset();

  forEachField(schema, (field, typeName) => {
    field.resolve = defaultFieldResolver;
  });
};

exports.combineMocks = combineMocks;
