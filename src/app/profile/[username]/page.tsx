import React, { Suspense } from "react";
import ProfileClient from "@/src/components/ProfileClient";
import ProfileSkeleton from "@/src/components/ProfileSkeleton";
import { User } from "@/src/generated/schema";

const APPSYNC_ENDPOINT = "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";

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

  const variables = { username };

  const res = await fetch(APPSYNC_ENDPOINT, {
    method: "POST",
    headers:  {
      "Content-Type":  "application/json",
      "x-api-key": APPSYNC_API_KEY,
    },
    body: JSON. stringify({ query, variables }),
    next: { revalidate: 30 }, // Revalidate every 30 seconds
  });

  if (!res.ok) {
    console.error("Failed to fetch user profile:", await res.text());
    return null;
  }

  const json = await res.json();
  console.log(json)
  return json?. data?.getUserByUserName ??  null;
}

// Async component that fetches data
async function ProfileContent({ username }: { username: string }) {
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

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent username={username} />
    </Suspense>
  );
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await fetchUserProfile(username);

  return {
    title: user ?  `@${username} - CORSA` : "User not found - CORSA",
    description:  user?.bio || `View ${username}'s profile on CORSA`,
  };
}