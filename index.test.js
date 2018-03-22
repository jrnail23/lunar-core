const {
  buildSchemaFromTypeDefinitions
  //  addMockFunctionsToSchema
} = require('graphql-tools');
const { graphql } = require('graphql');
const {
  addMockFunctionsToSchema,
  removeMockFunctionsFromSchema
} = require('./');
const { cacheResolver } = require('./store');

const schemaString = `
  type Foo {
    id: ID!
    stringValue: String
    bar: Bar
  }
  type Bar {
    id: String!
    stringValue: String
  }
  type RootQuery {
    intValue: Int
    stringValue: String
    boolValue: Boolean
    fooInstance: Foo
    fooById(id:String!): Foo
  }
  schema {
    query: RootQuery
  }
`;

describe('Mock', () => {
  it('mocks the default types for you', () => {
    const schema = buildSchemaFromTypeDefinitions(schemaString);
    addMockFunctionsToSchema({ schema });
    const testQuery = `{
      intValue
      stringValue
      boolValue
    }`;
    return graphql(schema, testQuery).then(
      ({ data: { intValue, stringValue, boolValue } }) => {
        expect(intValue).toBeGreaterThanOrEqual(-1000);
        expect(intValue).toBeLessThanOrEqual(1000);
        expect(typeof stringValue).toEqual('string');
        expect(typeof boolValue).toEqual('boolean');
      }
    );
  });

  it('mocks object types', () => {
    const schema = buildSchemaFromTypeDefinitions(schemaString);
    addMockFunctionsToSchema({ schema });
    const testQuery = `{
      fooInstance {
        id
        bar {
          id
        }
      }
    }`;
    return graphql(schema, testQuery).then(({ data: { fooInstance } }) => {
      expect(typeof fooInstance).toEqual('object');
      expect(typeof fooInstance.bar).toEqual('object');
    });
  });

  it('lets you tailor mocks with canned values', async () => {
    const schema = buildSchemaFromTypeDefinitions(schemaString);
    const mocks = {
      Foo: () => ({
        stringValue: 'baz'
      })
    };
    addMockFunctionsToSchema({ schema, mocks });
    const testQuery = `{
      fooInstance {
        stringValue
      }
    }`;
    const { data: { fooInstance: { stringValue } } } = await graphql(
      schema,
      testQuery
    );
    expect(stringValue).toEqual('baz');
  });

  describe('when querying using the same path twice', () => {
    it('uses consistent canned values', async () => {
      const schema = buildSchemaFromTypeDefinitions(schemaString);
      const mocks = {
        Foo: () => ({
          id: Math.random(),
          stringValue: 'baz'
        })
      };
      addMockFunctionsToSchema({ schema, mocks });
      const testQuery = `{
        fooInstance {
          id
          stringValue
        }
      }`;
      const { data: { fooInstance } } = await graphql(schema, testQuery);
      const { data: { fooInstance: fooInstance2 } } = await graphql(
        schema,
        testQuery
      );
      expect(fooInstance).toEqual(fooInstance2);
    });

    it('uses consistent mocked values', async () => {
      const schema = buildSchemaFromTypeDefinitions(schemaString);
      addMockFunctionsToSchema({ schema });
      const testQuery = `{
        fooInstance {
          id
          stringValue
        }
      }`;
      const { data: { fooInstance } } = await graphql(schema, testQuery);
      const { data: { fooInstance: fooInstance2 } } = await graphql(
        schema,
        testQuery
      );
      expect(fooInstance).toEqual(fooInstance2);
    });
  });

  it('lets you remove previously mocked values', async () => {
    const schema = buildSchemaFromTypeDefinitions(schemaString);
    const mocks = {
      Foo: () => ({
        stringValue: 'baz'
      })
    };
    addMockFunctionsToSchema({ schema, mocks });
    const testQuery = `{
      fooInstance {
        stringValue
      }
    }`;
    await graphql(schema, testQuery);

    removeMockFunctionsFromSchema({ schema, mocks });

    const { data: { fooInstance: fooInstance2 } } = await graphql(
      schema,
      testQuery
    );
    const { data: { fooInstance } } = await graphql(schema, testQuery);
    expect(fooInstance).toEqual(null);
  });
});
