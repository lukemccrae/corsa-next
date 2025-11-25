export type CognitoToken = {
    aud: string;
    auth_time: number;
    "cognito:username": string;
    email: string;
    email_verified: boolean;
    event_id: string;
    exp: number;
    iat: number;
    iss: string;
    jti: string;
    origin_jti: string;
    sub: string;
    token_use: string;
    preferred_username: string;
    picture: string;
  };
  
  // lightweight feed types for SmallPost and feed-related components

export type PostBase = {
  id?: string;
  streamId?: string;
  username?: string;
  profilePicture?: string | null;
  createdAt?: string; // ISO
};

export type TrackPost = PostBase & {
  type: "track";
  title?: string;
  startTime?: string;
  finishTime?: string;
  mileMarker?: number | string;
  cumulativeVert?: number | string;
  routeGpxUrl?: string;
  currentLocation?: { lat: number; lng: number } | null;
  // raw entry from getLiveStreams/getLiveStreamByUserId is acceptable too
  [k: string]: any;
};

export type CommentPost = PostBase & {
  type: "comment";
  text: string;
  inReplyTo?: string; // id of post being replied to
  // optionally reference streamId
  streamId?: string;
  [k: string]: any;
};

export type TextPost = PostBase & {
  type: "text";
  title?: string;
  text: string;
  attachmentUrl?: string | null;
  [k: string]: any;
};

export type TrackerPost = PostBase & {
  type: "tracker";
  trackerName?: string;
  status?: string;
  location?: string;
  [k: string]: any;
};

export type FeedPost = TrackPost | CommentPost | TextPost | TrackerPost;