const {mergeSchemas, makeExecutableSchema} = require('graphql-tools');
const deserialize = require('./deserialize');
const combineMocks = require('./combineMocks');
const addMockFunctionsToSchema = require('./addMockFunctionsToSchema');
const removeMockFunctionsFromSchema = require('./removeMockFunctionsFromSchema');
const lunarSchema = require('./lunarSchema');

const buildSchemaWithLunar = (schema, mocks = {}) => {
  const executableLunarSchema = makeExecutableSchema({typeDefs: lunarSchema});

  const lunarMocks = {
    Mutation: () => ({
      lunarMock: (parent, args) => {
        const jsonMocks = JSON.parse(args.mocks);
        const deserializedMocks = deserialize(jsonMocks);

        currentMocks.push(deserializedMocks);

        addMockFunctionsToSchema({schema, mocks: currentMocks});

        return true;
      },
      lunarReset: () => {
        currentMocks.splice(1, currentMocks.length);

        removeMockFunctionsFromSchema({schema});

        addMockFunctionsToSchema({schema, mocks: baseMocks});

        return true;
      },
    }),
  };

  const baseMocks = combineMocks(mocks, lunarMocks);
  const currentMocks = [baseMocks];

  const finalSchema = mergeSchemas({schemas: [schema, executableLunarSchema]});

  addMockFunctionsToSchema({schema: finalSchema, mocks: baseMocks});

  return finalSchema;
};

module.exports = buildSchemaWithLunar;
