import { domain } from "../context/domain.context";

const APPSYNC_ENDPOINT = domain.appsync;
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";

interface FetchSegmentDetailsArgs {
  segmentId: string;
}

interface FetchSegmentLeaderboardArgs {
  segmentId: string;
}

export const fetchSegmentDetails = async ({
  segmentId,
}: FetchSegmentDetailsArgs) => {
  const query = `
    query GetSegmentBySegmentId($segmentId:  ID!) {
      getSegmentBySegmentId(segmentId: $segmentId) {
        segmentId
        title
        description
        startTime
        route {
          name
          distance
          gain
          uom
          points {
            lat
            lng
          }
        }
      }
    }
  `;

  const variables = { segmentId };

  const response = await fetch(APPSYNC_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": APPSYNC_API_KEY,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch segment details: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export const fetchIntegrationData = async (username: string) => {
  // fetch integration data for use by the segment page
  const query = `
    query GetUserByUserName($username: String!) {
      getUserByUserName(username: $username) {
        stravaIntegration {
          athleteId
        }
      }
    }
  `;

  const variables = { username };

  const response = await fetch(APPSYNC_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": APPSYNC_API_KEY,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch integration data: ${response.statusText}`);
  }

  const result = await response.json();
  return result?.data?.getUserByUserName?.stravaIntegration || null;
};

export const fetchSegmentLeaderboard = async ({
  segmentId,
}: FetchSegmentLeaderboardArgs) => {
  const query = `
    query MyQuery {
      getSegmentLeaderboard(segmentId: "${segmentId}") {
        attemptCount
        lastEffortAt
        profilePicture
        segmentId
        userId
        username
      }
    }
  `;

  const variables = { segmentId };

  const response = await fetch(APPSYNC_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": APPSYNC_API_KEY,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch segment leaderboard: ${response.statusText}`
    );
  }

  const result = await response.json();
  return result;
};
