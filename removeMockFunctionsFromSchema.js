const {defaultFieldResolver} = require('graphql');
const {forEachField} = require('graphql-tools');
const {store} = require('./store');

const removeMockFunctionsFromSchema = ({schema}) => {
  const {reset} = store(schema);

  reset();

  forEachField(schema, field => {
    field.resolve = defaultFieldResolver;
  });
};

module.exports = removeMockFunctionsFromSchema;
