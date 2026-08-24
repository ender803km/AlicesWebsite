// Thin client for Railway's public GraphQL API, used only by the devs
// dashboard to show the bot service's recent logs and deploy status
// without anyone needing to open the Railway dashboard itself.
//
// Entirely optional: if RAILWAY_API_TOKEN isn't set, every function here
// throws a clearly-labeled error that the dev routes turn into a 503 with
// an explanatory message, rather than crashing the whole API.

const GRAPHQL_ENDPOINT = 'https://backboard.railway.com/graphql/v2';

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

async function railwayQuery(query, variables) {
  const token = requiredEnv('RAILWAY_API_TOKEN');
  // A project token (created from the project's Settings > Tokens page)
  // authenticates with this header instead of `Authorization: Bearer`.
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Project-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (!res.ok || json.errors) {
    const message = json.errors?.[0]?.message || `Railway API error (${res.status})`;
    throw new Error(message);
  }
  return json.data;
}

// Most recent deployment for a service, so we know which deployment's logs
// to pull and can report its status/age as a rough "uptime" proxy.
export async function getLatestDeployment(projectId, serviceId, environmentId) {
  const data = await railwayQuery(
    `query($input: DeploymentListInput!) {
      deployments(input: $input, first: 1) {
        edges { node { id status createdAt updatedAt } }
      }
    }`,
    { input: { projectId, serviceId, environmentId } },
  );
  return data.deployments.edges[0]?.node || null;
}

export async function getDeploymentLogs(deploymentId, { limit = 200, filter } = {}) {
  const data = await railwayQuery(
    `query($deploymentId: String!, $limit: Int, $filter: String) {
      deploymentLogs(deploymentId: $deploymentId, limit: $limit, filter: $filter) {
        timestamp
        message
        severity
      }
    }`,
    { deploymentId, limit, filter },
  );
  return data.deploymentLogs;
}
