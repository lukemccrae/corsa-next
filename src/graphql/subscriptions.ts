type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

type OnNewChatSubscriptionVariables = {
  streamId: string,
};

type OnNewChatSubscription = {
  onNewChat?:  {
    __typename: "ChatMessage",
    userId: string,
    createdAt: string,
    text: string,
    profilePicture: string,
    streamId?: string | null,
    username?: string | null,
    firstName?: string | null,
    lastName?: string | null,
  } | null,
};


export const onNewChat = /* GraphQL */ `subscription onNewChat($streamId: ID!) {
  onNewChat(streamId: $streamId) {
    userId
    createdAt
    text
    profilePicture
    streamId
    username
    firstName
    lastName
    __typename
  }
}
` as GeneratedSubscription<
  OnNewChatSubscriptionVariables,
  OnNewChatSubscription
>;
