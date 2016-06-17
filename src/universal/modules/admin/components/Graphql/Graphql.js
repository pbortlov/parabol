import './addCSS';
import React from 'react';
import GraphiQL from 'graphiql';
import fetch from 'isomorphic-fetch';
import {getGraphQLHost, getGraphQLProtocol} from 'universal/utils/graphQLConfig';

const graphQLHost = getGraphQLHost();
const graphQLProtocol = getGraphQLProtocol();

// TODO use cashay to get the authToken
const graphQLFetcher = async (graphQLParams) => {
  if (!__CLIENT__) {
    return undefined;
  }
  const variables = graphQLParams.variables ?
    JSON.parse(graphQLParams.variables) : undefined;
  const res = await fetch(`${graphQLProtocol}//${graphQLHost}/graphql`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({ query: graphQLParams.query, variables })
  });
  return res.json();
};

export default function Graphiql() {
  return (
    <GraphiQL fetcher={graphQLFetcher} />
  );
}
