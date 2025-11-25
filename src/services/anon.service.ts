import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { domain } from '../context/domain.context';
import { Anon } from '../context/UserContext';

interface GetPublishedUserInfoProps {
  username: String;
  anon: Anon;
  userId?: String;
}

interface GetPointsForLivestream {
  streamId: string;
  anon: Anon;
}

interface GetChatByStreamIdProps {
  streamId: string;
  anon: Anon;
}

// Your AppSync API endpoint
const APPSYNC_ENDPOINT = domain.appsync;


export const anonFetch = async (query: string, anon: Anon, variables?: any) => {
  // Prepare HTTP request
  const request = new HttpRequest({
    method: 'POST',
    hostname: new URL(APPSYNC_ENDPOINT).hostname,
    path: '/graphql',
    headers: {
      'Content-Type': 'application/json',
      host: new URL(APPSYNC_ENDPOINT).hostname,
    },
    body: JSON.stringify({ query, variables }),
  });

  // Sign the request using SignatureV4
  const signer = new SignatureV4({
    credentials: anon,
    region: 'us-west-1', // Replace with your AWS region
    service: 'appsync',
    sha256: Sha256,
  });

  const signedRequest = await signer.sign(request);

  // Send the signed request using fetch API
  const response = await fetch(APPSYNC_ENDPOINT, {
    method: signedRequest.method,
    headers: signedRequest.headers,
    body: signedRequest.body,
  });

  const responseData = await response.json();
  return responseData;
};

export const fetchMapDetails = async (bucketKey: string, anon: Anon) => {
  const query = `
    query MyQuery {
      getGeoJsonBySortKey(sortKey: "${bucketKey}") {
        type
        features {
          properties {
            id
            minPace
            minGrade
          }
        }
      }
    }

  `;
  const result = await anonFetch(query, anon);
  return result;
};

export const getChatByStreamId = async (props: GetChatByStreamIdProps) => {
  const query = `query MyQuery {
    getChatByStreamId(streamId: "${props.streamId}") {
      username
      text
      createdAt
      profilePicture
    }
  }`;
  const result = await anonFetch(query, props.anon);
  return result;
};

export const retrieveMapResource = async (url: string): Promise<string> => {
  try {
    if(url) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch GPX file: ${response.statusText}`);
      }
      const gpxText = await response.text();
      return gpxText;
    } else {
      return "No route"
    }


  } catch (error) {
    console.error('Error retrieving GPX route:', error);
    throw error;
  }
};

// TODO: POINTS SHOULD BE ON THE LIVESTREAM THIS IS A TEMP SOLUTION
export const getPointsForLivestream = async (props: GetPointsForLivestream) => {
  const query = `query MyQuery {
    getPointsByStreamId(streamId: "${props.streamId}") {
      lat
      long
      message
      streamId
      timestamp
      altitude
      mileMarker
      cumulativeVert
    }
  }`;
  const result = await anonFetch(query, props.anon);
  return result;
};

export const getLivestreamByUserId = async (props: GetPublishedUserInfoProps) => {
  const query = `query MyQuery {
    getLiveStreamByUserId(username: "${props.username}") {
      currentLocation {
        lat
        lng
      }
      profilePicture
      streamId
      activeStreamId
      title
      startTime
      finishTime
      timezone
      delayInSeconds
      unitOfMeasure
      sponsors {
        name
        image
        link
      }
      username
      deviceLogo
      lastSeen
      streamArticle
      sectionSplits {
        sectionName
        historicalTime
        splitTime
      }
      historicalTrack {
        file
        profilePicture
        name
        tripReport
      }
      routeGpxUrl
      mileMarker
      cumulativeVert
      additionalMapResources {
        url
        type
      }
    }
  }`;
  const result = await anonFetch(query, props.anon);
  return result;
};

export const getPublishedUserInfo = async (props: GetPublishedUserInfoProps) => {
  const query = `
    query MyQuery {
      getPublishedUserInfo(username: "${props.username}") {
        profilePicture
        bio
        plans {
          name
          slug
          coverImage
          profilePhoto
          author
          coverText
          published
          startTime
        }

      }
    }
  `;

  const result = await anonFetch(query, props.anon);
  return result;
};

export const fetchPublishedPlans = async (anon: Anon) => {
  const query = `
    query MyQuery {
      getPublishedPlans {
        name
        coverImage
        profilePhoto
        author
        slug
      }
    }
  `;
  const result = await anonFetch(query, anon);
  return result;
};

export const getLiveStreams = async (anon: Anon) => {
  const query = `
    query MyQuery {
      getLiveStreams {
        profilePicture
        startTime
        streamId
        finishTime
        published
        mileMarker
        live
        title
        imei
        username
        currentLocation {
          lat
          lng
        }
      }
    }
`;
  const result = await anonFetch(query, anon);
  return result;
};

export const fetchPlanDetails = async (userId: string, slug: string, anon: Anon) => {
  const query = `
    query MyQuery {
      getPlanById(slug: "${slug}", userId: "${userId}") {
        activityType
        distanceInMiles
        durationInSeconds
        gainInMeters
        gap
        subHeading
        lastMileDistance
        lossInMeters
        mileData {
          elevationGain
          elevationLoss
          gap
          mileVertProfile
          pace
          stopTime
        }
        name
        activityType
        published
        startTime
        userId
        coverImage
        profilePhoto
        author
        publishDate
        articleElements {
          ... on TextElement {
            text {
              content
            }
          }
          ... on PaceTableElement {
            paceTable {
              columns
              miles
            }
          }
        }
      }
    }
  `;
  const result = await anonFetch(query, anon);

  return result;
};
