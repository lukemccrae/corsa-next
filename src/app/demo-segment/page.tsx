"use client";
import React, { useEffect, useState, Suspense } from "react";
import { Dropdown } from "primereact/dropdown";
import { Card } from "primereact/card";
import { useTheme } from "@/src/components/ThemeProvider";
import { useUser } from "@/src/context/UserContext";
import SegmentLeaderboard from "@/src/components/SegmentLeaderboard";
import dynamic from "next/dynamic";
import { Button } from "primereact/button";
import { useSearchParams } from "next/navigation";

const SmallTrackMap = dynamic(() => import("@/src/components/SmallTrackMap"), {
  ssr: false,
});

// Segment data from your image
const SEGMENTS = [
  {
    label: "Burrito League Calgary",
    value: "burrito-league-calgary",
    city: "Calgary",
    state: "Alberta",
    country: "CAN",
  },
  {
    label:  "Burrito League Blairmore",
    value: "burrito-league-blairmore",
    city: "Crowsnest Pass",
    state:  "Alberta",
    country: "CAN",
  },
  {
    label: "Tempe Burrito League",
    value: "tempe-burrito-league",
    city: "Tempe",
    state: "AZ",
    country: "USA",
  },
  {
    label: "CocoLocoBurrito",
    value: "cocolocoburrito",
    city: "Flagstaff",
    state: "AZ",
    country: "USA",
  },
  {
    label: "Tucson Burrito League",
    value: "tucson-burrito-league",
    city: "Tucson",
    state:  "AZ",
    country: "USA",
  },
  {
    label: "Prescott Burrito League",
    value: "prescott-burrito-league",
    city: "Prescott",
    state:  "AZ",
    country: "USA",
  },
  {
    label: "Marana Burrito League",
    value: "marana-burrito-league",
    city: "Marana",
    state: "AZ",
    country: "USA",
  },
  {
    label: "Gila Bend Burrito League",
    value: "gila-bend-burrito-league",
    city:  "Gila Bend",
    state: "AZ",
    country: "USA",
  },
  {
    label:  "Burrito League - Oscar's Mexican Restaurant",
    value: "burrito-league-oscars",
    city: "Redlands",
    state: "CA",
    country: "USA",
  },
  {
    label: "Burrito League San Francisco",
    value: "burrito-league-sf",
    city: "San Francisco",
    state: "CA",
    country:  "USA",
  },
  {
    label: "Burrito League - Santa Barbara w/ rabbit",
    value: "burrito-league-santa-barbara",
    city: "Santa Barbara",
    state: "CA",
    country: "USA",
  },
  {
    label: "Burrito League Denver OFFICIAL Route",
    value: "burrito-league-denver",
    city: "Denver / Wheat Ridge",
    state: "CO",
    country: "USA",
  },
  {
    label: "Boulder Burrito League",
    value: "boulder-burrito-league",
    city: "Boulder",
    state: "CO",
    country: "USA",
  },
  {
    label:  "Castle Rock Burrito League",
    value: "castle-rock-burrito-league",
    city:  "Castle Rock",
    state:  "CO",
    country: "USA",
  },
];

// Mock leaderboard data generator
const generateMockLeaderboard = (segmentName: string) => {
  const baseUsers = [
    {
      username: "go_shep",
      profilePicture: "https://i.pravatar.cc/150? img=12",
    },
    {
      username:  "jamilcoury",
      profilePicture:  "https://i.pravatar.cc/150?img=33",
    },
    {
      username: "dirty. t. run. club",
      profilePicture:  "https://i.pravatar.cc/150?img=45",
    },
    {
      username: "finding_my_dirt",
      profilePicture:  "https://i.pravatar.cc/150?img=8",
    },
    {
      username: "cprunsfar",
      profilePicture:  "https://i.pravatar.cc/150?img=28",
    },
    { username: "amglaze", profilePicture: "https://i.pravatar.cc/150?img=15" },
    {
      username: "zachmayfield95",
      profilePicture:  "https://i.pravatar.cc/150?img=22",
    },
    {
      username: "sam_marks",
      profilePicture:  "https://i.pravatar.cc/150?img=37",
    },
    {
      username: "lukejay180",
      profilePicture:  "https://i.pravatar.cc/150?img=42",
    },
    {
      username: "trappephoto",
      profilePicture:  "https://i.pravatar.cc/150?img=50",
    },
  ];

  const shuffled = [...baseUsers].sort(() => Math.random() - 0.5);

  return shuffled.map((user, index) => ({
    rank: index + 1,
    userId: `user-${index}`,
    username: user.username,
    profilePicture:  user.profilePicture,
    time: 600 + Math.floor(Math.random() * 300) + index * 15,
    date: new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
    attemptCount: Math.floor(Math.random() * 10) + 1,
    lastEffort: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    gender: Math.random() > 0.5 ? ("M" as const) : ("F" as const),
  }));
};

// Mock route points for map
const generateMockRoute = (): [number, number][] => {
  const startLat = 33.4 + Math.random() * 0.05;
  const startLng = -111.9 + Math.random() * 0.05;

  const points: [number, number][] = [];
  for (let i = 0; i < 20; i++) {
    points.push([
      startLat + i * 0.001 + Math.random() * 0.0005,
      startLng + i * 0.001 + Math.random() * 0.0005,
    ]);
  }
  return points;
};

type StravaAthlete = {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  profile:  string;
  city: string;
  state: string;
  country: string;
};

// Extract the component that uses useSearchParams into a separate component
function SegmentContent() {
  const { theme } = useTheme();
  const { user } = useUser();
  const searchParams = useSearchParams();

  const [selectedSegment, setSelectedSegment] = useState(
    "tempe-burrito-league"
  );
  const [loading, setLoading] = useState(false);
  const [stravaAthlete, setStravaAthlete] = useState<StravaAthlete | null>(null);
  const [stravaLoading, setStravaLoading] = useState(false);
  const [stravaError, setStravaError] = useState<string | null>(null);

  // Check for OAuth code in URL params
  useEffect(() => {
    const code = searchParams?. get("code");
    const scope = searchParams?.get("scope");

    if (code && ! stravaAthlete && ! stravaLoading) {
      handleStravaCallback(code, scope);
    }
  }, [searchParams]);

  const handleStravaCallback = async (code: string, scope: string | null) => {
    setStravaLoading(true);
    setStravaError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockAthlete: StravaAthlete = {
        id: 12345678,
        username: "strava_runner_" + Math.floor(Math.random() * 1000),
        firstname: "Demo",
        lastname: "Athlete",
        profile: "https://i.pravatar.cc/150? img=" + Math.floor(Math.random() * 70),
        city: "Tempe",
        state: "Arizona",
        country: "USA",
      };

      setStravaAthlete(mockAthlete);
      localStorage.setItem("strava_athlete", JSON.stringify(mockAthlete));
      window.history.replaceState({}, "", "/demo-segment");

    } catch (error) {
      console.error("Strava auth error:", error);
      setStravaError("Failed to connect with Strava. Please try again.");
    } finally {
      setStravaLoading(false);
    }
  };

  // Load saved Strava athlete from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("strava_athlete");
    if (saved) {
      try {
        setStravaAthlete(JSON. parse(saved));
      } catch (e) {
        console.error("Error parsing saved Strava data:", e);
      }
    }
  }, []);

  const handleStravaConnect = () => {
    const stravaAuthUrl =
      "https://www.strava.com/oauth/authorize?client_id=69281&redirect_uri=https://corsa-next-735i.vercel.app/demo-segment&response_type=code&scope=activity:read";
    window. location.href = stravaAuthUrl;
  };

  const segmentData = selectedSegment
    ? {
        name:  SEGMENTS.find((s) => s.value === selectedSegment)?.label || "",
        distance: 3.1 + Math.random() * 2,
        elevationGain: 150 + Math.floor(Math.random() * 300),
        leaderboard: generateMockLeaderboard(selectedSegment),
        routePoints: generateMockRoute(),
      }
    : null;

  const handleSegmentChange = async (e: { value: string }) => {
    setLoading(true);
    setSelectedSegment(e.value);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(false);
  };

  const cardBg =
    theme === "dark"
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-200";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Hero Section with Image */}
      <div className="relative w-full h-[400px] mb-8 overflow-hidden">
        <img
          src="https://www.mountainoutpost.com/wp-content/uploads/2026/01/Untitled-design-1024x576.png"
          alt="Burrito League runners"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <h1 className="text-5xl font-bold text-white mb-2">
              Burrito League Segments
            </h1>
            <p className="text-xl text-gray-200">
              Run, compete, and enjoy burritos across North America
            </p>
          </div>
        </div>
      </div>

      {/* Strava Integration Section */}
      <div className={`max-w-4xl mx-auto px-4 mb-8 ${cardBg} rounded-lg border p-6`}>
        <div className="flex items-center gap-4 mb-4">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Strava_Logo.svg"
            alt="Powered by Strava"
            className="h-8"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Connect with Strava</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sync your activities and compete on leaderboards
            </p>
          </div>
        </div>
        <Button
          label={stravaAthlete ? `Connected as ${stravaAthlete. username}` : "Connect with Strava"}
          icon={stravaLoading ? "pi pi-spin pi-spinner" : "pi pi-link"}
          onClick={handleStravaConnect}
          disabled={!! stravaAthlete || stravaLoading}
          className="w-full"
          severity={stravaAthlete ? "success" : "info"}
        />
      </div>

      {/* Segment Selector */}
      <div className={`max-w-4xl mx-auto px-4 mb-8 ${cardBg} rounded-lg border p-6`}>
        <div className="space-y-4">
          <label className="text-lg font-semibold">Choose a Segment</label>
          <Dropdown
            value={selectedSegment}
            options={SEGMENTS}
            onChange={handleSegmentChange}
            placeholder="Select a Burrito League segment"
            className="w-full"
            filter
          />

          {selectedSegment && (
            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <i className="pi pi-map-marker" />
                {SEGMENTS.find((s) => s.value === selectedSegment)?.city}
              </div>
              <div className="flex items-center gap-1">
                <i className="pi pi-globe" />
                {SEGMENTS. find((s) => s.value === selectedSegment)?.state},{" "}
                {SEGMENTS.find((s) => s.value === selectedSegment)?.country}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-6xl mx-auto px-4 text-center py-12">
          <i className="pi pi-spin pi-spinner text-4xl text-blue-500" />
        </div>
      )}

      {/* Segment Details */}
      {!loading && segmentData && (
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard - takes up 2 columns */}
          <div className="lg:col-span-2">
            <SegmentLeaderboard
              segmentName={segmentData.name}
              segmentDistance={segmentData.distance}
              segmentElevationGain={segmentData.elevationGain}
              entries={segmentData.leaderboard}
              currentUserId={user?.userId}
            />
          </div>

          {/* Map - takes up 1 column */}
          <div className="lg:col-span-1">
            <Card className={cardBg}>
              <h3 className="text-xl font-semibold mb-4">Route Map</h3>
              <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <SmallTrackMap
                  points={segmentData.routePoints}
                  zoom={13}
                  className="h-64"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Distance
                  </div>
                  <p className="text-lg font-semibold">
                    {segmentData. distance.toFixed(2)} mi
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark: bg-gray-700 rounded-lg">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Elevation
                  </div>
                  <p className="text-lg font-semibold">
                    {segmentData.elevationGain} ft
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
      
      {/* Info Card */}
      <div className={`max-w-6xl mx-auto px-4 mt-8 ${cardBg} rounded-lg border p-6`}>
        <div className="flex items-start gap-4">
          <i className="pi pi-info-circle text-2xl text-blue-500 mt-1" />
          <div>
            <h3 className="text-xl font-semibold mb-2">About Burrito Leagues</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Burrito Leagues are community running events where participants
              race to a local burrito restaurant. Each segment represents a
              different location across North America.  Track your times, compete
              on leaderboards, and join the community!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component wrapped with Suspense
export default function SegmentDemoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <i className="pi pi-spin pi-spinner text-4xl text-blue-500" />
      </div>
    }>
      <SegmentContent />
    </Suspense>
  );
}