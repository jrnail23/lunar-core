const {ApolloServer} = require('apollo-server');
const {makeExecutableSchema} = require('graphql-tools');
const gql = require('graphql-tag');
const {buildSchemaWithLunar} = require('./index');

const appSchema = gql`
  schema {
    query: RootQuery
    mutation: RootMutation
  }

  type RootQuery {
    foo: String!
  }

  type RootMutation {
    changeSomething: String!
  }
`;
const executableSchema = makeExecutableSchema({typeDefs: appSchema});

const schema = buildSchemaWithLunar(executableSchema, {});

const server = new ApolloServer({schema});

server.listen({port: 3001}).then(({url}) => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Server ready at ${url}`);
});
