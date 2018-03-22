const { defaultFieldResolver } = require('graphql');
const { forEachField, addMockFunctionsToSchema } = require('graphql-tools');
const { store } = require('./store');

exports.addMockFunctionsToSchema = ({
  schema,
  mocks = {},
  preserveResolvers = false
}) => {
  addMockFunctionsToSchema({ schema, mocks, preserveResolvers });

  const { track } = store(schema);

  forEachField(schema, (field, typeName) => {
    if (typeName === 'Mutation') return;
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
