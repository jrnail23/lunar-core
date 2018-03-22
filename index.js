const { defaultFieldResolver } = require('graphql');
const { forEachField, addMockFunctionsToSchema } = require('graphql-tools');
const { store } = require('./store');
const combineMocks = require('./combineMocks');

exports.addMockFunctionsToSchema = ({
  schema,
  mocks: mocksIn = {},
  preserveResolvers = false
}) => {
  const mocks = Array.isArray(mocksIn)
    ? combineMocks(schema, ...mocksIn)
    : mocksIn;

  addMockFunctionsToSchema({ schema, mocks, preserveResolvers });

  const { track } = store(schema);

  const MutationTypeName = schema.getMutationType().name;

  forEachField(schema, (field, typeName) => {
    if (typeName === MutationTypeName) return;
    field.resolve = track(field.resolve);
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
