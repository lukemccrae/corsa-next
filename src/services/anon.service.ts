import { Sha256 } from "@aws-crypto/sha256-js";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { SignatureV4 } from "@aws-sdk/signature-v4";

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
  const url = new URL(APPSYNC_ENDPOINT);

  const body = JSON.stringify({ query, variables });

  // Compute SHA256 hash of the request body
  const hasher = new Sha256();
  hasher.update(body);
  const hashBytes = await hasher.digest();
  const bodyHashHex = Buffer.from(hashBytes).toString("hex");

  const request = new HttpRequest({
    method: "POST",
    protocol: url.protocol,
    hostname: url.hostname,
    // AppSync expects /graphql for this endpoint
    path: url.pathname || "/graphql",
    headers: {
      "Content-Type": "application/json",
      host: url.hostname,
      "x-amz-content-sha256": bodyHashHex,
    },
    body,
  });

  const signer = new SignatureV4({
    credentials: anon,   // MUST contain accessKeyId, secretAccessKey, sessionToken
    region: "us-west-1",
    service: "appsync",
    sha256: Sha256,
  });

  const signed = await signer.sign(request);

  const response = await fetch(APPSYNC_ENDPOINT, {
    method: signed.method,
    headers: signed.headers,
    body: signed.body,  // EXACT signed body
  });

  return response.json();
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
      getUserByUserName(username: "${props.username}") {
        bio
        profilePicture
        userId
        username
        posts {
          ... on BlogPost {
            createdAt
            type
            title
            text
            userId
          }
          ... on LivestreamPost {
            id
            createdAt
            stream {
              title
              profilePicture
              startTime
              finishTime
              mileMarker
              live
              username
              currentLocation {
                lat
                lng
              }
            }
            userId
            type
          }
          ... on PhotoPost {
            id
            caption
            type
            createdAt
            imageUrl
            userId
          }
          ... on StatusPost {
            id
            createdAt
            type
            userId
            text
          }
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
