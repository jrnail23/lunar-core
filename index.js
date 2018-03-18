const { forEachField, addMockFunctionsToSchema } = require('graphql-tools');
const { store } = require('./store');

exports.addMockFunctionsToSchema = ({
  schema,
  mocks = {},
  preserveResolvers = false
}) => {
  addMockFunctionsToSchema({ schema, mocks, preserveResolvers });

  forEachField(schema, (field, typeName) => {
    if (typeName === 'Mutation') return;
    field.resolve = store(schema)(field.resolve);
  });
};
