export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Badge = {
  __typename?: 'Badge';
  name: Scalars['String']['output'];
  version: Scalars['String']['output'];
};

export type BlogPost = Post & {
  __typename?: 'BlogPost';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  mentions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  text: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: PostType;
  userId: Scalars['ID']['output'];
};

/**
 *   -----------------------
 *  ChatMessage
 *  -----------------------
 */
export type ChatMessage = {
  __typename?: 'ChatMessage';
  badges?: Maybe<Array<Maybe<Badge>>>;
  createdAt: Scalars['String']['output'];
  messageId: Scalars['ID']['output'];
  messageType?: Maybe<MessageType>;
  role?: Maybe<UserRole>;
  stream?: Maybe<LiveStream>;
  text: Scalars['String']['output'];
  userColor?: Maybe<Scalars['String']['output']>;
  username: Scalars['String']['output'];
};

export type ChatMessageInput = {
  createdAt: Scalars['String']['input'];
  streamId: Scalars['ID']['input'];
  text: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};

export enum DeviceLogo {
  Bivy = 'BIVY',
  Garmin = 'GARMIN'
}

/**
 *   -----------------------
 *  Supporting types
 *  -----------------------
 */
export type LatLng = {
  __typename?: 'LatLng';
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
};

/**
 *   -----------------------
 *  LiveStream
 *  -----------------------
 */
export type LiveStream = {
  __typename?: 'LiveStream';
  chatMessages?: Maybe<Array<Maybe<ChatMessage>>>;
  currentLocation?: Maybe<LatLng>;
  delayInSeconds?: Maybe<Scalars['Int']['output']>;
  deviceLogo?: Maybe<DeviceLogo>;
  fullRouteData?: Maybe<Scalars['String']['output']>;
  live?: Maybe<Scalars['Boolean']['output']>;
  routeGpxUrl?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  sponsors?: Maybe<Array<Maybe<Sponsor>>>;
  startTime?: Maybe<Scalars['String']['output']>;
  streamId: Scalars['ID']['output'];
  title?: Maybe<Scalars['String']['output']>;
  unitOfMeasure?: Maybe<UnitOfMeasure>;
  waypoints?: Maybe<Array<Maybe<Waypoint>>>;
};

/**   LiveStream as a post */
export type LivestreamPost = Post & {
  __typename?: 'LivestreamPost';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  mentions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  stream: LiveStream;
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  type: PostType;
  userId: Scalars['ID']['output'];
};

export enum MessageType {
  Chat = 'CHAT',
  Pinned = 'PINNED',
  System = 'SYSTEM'
}

export type Mutation = {
  __typename?: 'Mutation';
  publishChat: ChatMessage;
  publishWaypoint: Waypoint;
  upsertLiveStream: LiveStream;
};


export type MutationPublishChatArgs = {
  input: ChatMessageInput;
};


export type MutationPublishWaypointArgs = {
  input: WaypointInput;
};


export type MutationUpsertLiveStreamArgs = {
  startTime: Scalars['String']['input'];
  streamId: Scalars['ID']['input'];
};

export type PhotoPost = Post & {
  __typename?: 'PhotoPost';
  caption?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  imageUrl: Scalars['String']['output'];
  mentions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  type: PostType;
  userId: Scalars['ID']['output'];
};

export type Post = {
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  mentions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  type: PostType;
  userId: Scalars['ID']['output'];
};

export enum PostType {
  Blog = 'BLOG',
  Livestream = 'LIVESTREAM',
  Photo = 'PHOTO',
  Status = 'STATUS'
}

export type Query = {
  __typename?: 'Query';
  getUserByUserName?: Maybe<User>;
};


export type QueryGetUserByUserNameArgs = {
  username: Scalars['ID']['input'];
};

export type Sponsor = {
  __typename?: 'Sponsor';
  image?: Maybe<Scalars['String']['output']>;
  link?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type StatusPost = Post & {
  __typename?: 'StatusPost';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  mentions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  text: Scalars['String']['output'];
  type: PostType;
  userId: Scalars['ID']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  onNewChat?: Maybe<ChatMessage>;
  onNewWaypoint?: Maybe<Waypoint>;
};


export type SubscriptionOnNewChatArgs = {
  streamId: Scalars['ID']['input'];
};


export type SubscriptionOnNewWaypointArgs = {
  streamId: Scalars['ID']['input'];
};

export enum UnitOfMeasure {
  Imperial = 'IMPERIAL',
  Metric = 'METRIC'
}

/**
 *   -----------------------
 *  User
 *  -----------------------
 */
export type User = {
  __typename?: 'User';
  bio?: Maybe<Scalars['String']['output']>;
  liveStreams?: Maybe<Array<Maybe<LiveStream>>>;
  posts?: Maybe<Array<Maybe<Post>>>;
  profilePicture?: Maybe<Scalars['String']['output']>;
  userId: Scalars['ID']['output'];
  username: Scalars['String']['output'];
};


/**
 *   -----------------------
 *  User
 *  -----------------------
 */
export type UserLiveStreamsArgs = {
  slug?: InputMaybe<Scalars['String']['input']>;
  streamId?: InputMaybe<Scalars['ID']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export enum UserRole {
  Bot = 'BOT',
  Broadcaster = 'BROADCASTER',
  Moderator = 'MODERATOR',
  Subscriber = 'SUBSCRIBER',
  Viewer = 'VIEWER'
}

/**
 *   -----------------------
 *  Waypoint
 *  -----------------------
 */
export type Waypoint = {
  __typename?: 'Waypoint';
  altitude?: Maybe<Scalars['Float']['output']>;
  cumulativeVert?: Maybe<Scalars['Float']['output']>;
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
  mileMarker?: Maybe<Scalars['Float']['output']>;
  pointIndex?: Maybe<Scalars['Int']['output']>;
  stream?: Maybe<LiveStream>;
  timestamp: Scalars['String']['output'];
  waypointId: Scalars['ID']['output'];
};

/**
 *   -----------------------
 *  Inputs
 *  -----------------------
 */
export type WaypointInput = {
  altitude?: InputMaybe<Scalars['Float']['input']>;
  cumulativeVert?: InputMaybe<Scalars['Float']['input']>;
  lat: Scalars['Float']['input'];
  lng: Scalars['Float']['input'];
  mileMarker?: InputMaybe<Scalars['Float']['input']>;
  pointIndex?: InputMaybe<Scalars['Int']['input']>;
  streamId: Scalars['ID']['input'];
  timestamp: Scalars['String']['input'];
};


