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
  