const gql = require('graphql-tag');

const lunarSchema = gql`
  schema {
    mutation: Mutation
  }

  type Mutation {
    lunarMock(mocks: String!): Boolean!
    lunarReset: Boolean!
  }
`;

module.exports = lunarSchema;
