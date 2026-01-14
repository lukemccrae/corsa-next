import { domain } from "../context/domain.context";
import { anonFetch } from "./anon.service";
import { Anon } from "../context/UserContext";

const APPSYNC_ENDPOINT = domain.appsync;

interface FetchSegmentDetailsArgs {
  segmentId: string;
  anon: Anon;
}

interface FetchSegmentLeaderboardArgs {
  segmentId: string;
  anon: Anon;
}

interface FetchIntegrationDataArgs {
  username: string;
  anon: Anon;
}

export const fetchSegmentDetails = async ({
  segmentId,
  anon,
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
  const result = await anonFetch(query, anon, variables);
  return result;
};

export const fetchIntegrationData = async ({
  username,
  anon,
}: FetchIntegrationDataArgs) => {
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
  const result = await anonFetch(query, anon, variables);
  return result?.data?.getUserByUserName?.stravaIntegration || null;
};

export const fetchSegmentLeaderboard = async ({
  segmentId,
  anon,
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
        firstName
        lastName
      }
    }
  `;

  const result = await anonFetch(query, anon);
  console.log(result)
  return result;
};
