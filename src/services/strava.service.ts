export interface StravaInitialIntegrationArgs {
  code: string;
  userId: string;
  username: string;
}

export interface StravaTokenResponse {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete:  {
    id: number;
    username: string;
    resource_state: number;
    firstname: string;
    lastname: string;
    bio: string;
    city: string;
    state: string;
    country: string;
    sex: string;
    premium: boolean;
    summit:  boolean;
    created_at: string;
    updated_at: string;
    badge_type_id: number;
    weight: number;
    profile_medium:  string;
    profile: string;
    friend:  null;
    follower: null;
  };
}

export const stravaInitialIntegration = async (args: StravaInitialIntegrationArgs) => {
  console.log(args, '<< args');

  const { code, userId, username } = args;

  if (!code || !userId) {
    throw new Error('Missing required parameters:  code and userId');
  }

  const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID || '69281';
  const STRAVA_CLIENT_SECRET = process.env. STRAVA_CLIENT_SECRET;

  if (!STRAVA_CLIENT_SECRET) {
    throw new Error('STRAVA_CLIENT_SECRET not configured');
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method:  'POST',
      headers:  {
        'Content-Type':  'application/json',
      },
      body:  JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Strava token exchange failed:', errorData);
      // throw new Error(`Strava OAuth failed: ${errorData.message || tokenResponse.statusText}`);
    }

    const tokenData:  StravaTokenResponse = await tokenResponse.json();

    // Store the integration in DynamoDB
    // TODO: Replace with your actual DynamoDB logic
    const integrationData = {
      userId,
      username,
      provider: 'strava',
      athleteId: tokenData.athlete. id. toString(),
      athleteName: `${tokenData.athlete.firstname} ${tokenData.athlete.lastname}`,
      athleteUsername: tokenData.athlete.username,
      athleteAvatar: tokenData.athlete.profile,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: tokenData.expires_at,
      scopes: ['activity:read', 'profile:read_all'],
      connectedAt: new Date().toISOString(),
      athleteData: tokenData.athlete,
    };

    console.log('Strava integration successful:', {
      userId,
      athleteId: tokenData.athlete. id,
      athleteName: `${tokenData.athlete.firstname} ${tokenData.athlete.lastname}`,
    });

    // Return sanitized data (without tokens)
    return {
      success: true,
      provider: 'strava',
      athleteId: tokenData.athlete. id.toString(),
      athleteName: `${tokenData.athlete.firstname} ${tokenData.athlete. lastname}`,
      athleteAvatar: tokenData.athlete.profile,
      connectedAt: integrationData.connectedAt,
    };
  } catch (error:  any) {
    console.error('Error in stravaInitialIntegration:', error);
    throw new Error(`Failed to complete Strava integration: ${error. message}`);
  }
};