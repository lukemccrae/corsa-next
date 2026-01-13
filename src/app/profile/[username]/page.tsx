import React from "react";
import ProfileClient from "@/src/components/ProfileClient";
import { User } from "@/src/generated/schema";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { anonFetch } from "@/src/services/anon.service";

async function getAnonCreds() {
  const credentialsProvider = fromCognitoIdentityPool({
    identityPoolId: "us-west-1:495addf9-156d-41fd-bf55-3c576a9e1c5e",
    clientConfig: { region: "us-west-1" },
  });
  return await credentialsProvider();
}

async function fetchUserProfile(username: string) {
  const query = `
    query MyQuery {
      getUserByUserName(username: "${username}") {
        bio
        live
        username
        userId
        profilePicture
        posts {
          ... on LivestreamPost {
            __typename
            tags
            type
            userId
            stream {
              finishTime
              deviceLogo
              streamId
              currentLocation {
                lat
                lng
              }
              live
              username
              userId
              title
            }
            createdAt
          }
        }
      }
    }
  `;

  try {
    const anon = await getAnonCreds();
    const json = await anonFetch(query, anon);
    console.log(json);
    return json?.data?.getUserByUserName ?? null;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return null;
  }
}

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const username = params.username;
  const user = await fetchUserProfile(username);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <i className="pi pi-user text-6xl text-gray-400 mb-4 block" />
        <h1 className="text-2xl font-bold mb-2">User not found</h1>
        <p className="text-gray-600 dark:text-gray-400">
          The profile @{username} doesn't exist. 
        </p>
      </div>
    );
  }

  return <ProfileClient user={user as User} username={username} />;
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: { username: string };
}) {
  const username = params.username;
  const user = await fetchUserProfile(username);

  return {
    title: user ?  `@${username} - CORSA` : "User not found - CORSA",
    description:  user?.bio || `View ${username}'s profile on CORSA`,
  };
}