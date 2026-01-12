import { domain } from '../context/domain.context';
import { retrieveUserToken } from '../helpers/token.helper';

export interface StravaCallbackArgs {
  code: string;
  userId: string;
  username: string;
  cognito_username: string;
}

export const exchangeStravaCode = async (args: StravaCallbackArgs) => {
  const { code, username, cognito_username } = args;
  const userId = cognito_username; //cognito username is the PK of the user 
  try {
    const response = await fetch(`${domain.utilityApi}/integration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${retrieveUserToken()}`,
      },
      body: JSON.stringify({
        code,
        userId,
        username,
        provider: 'strava',
      }),
    });

    const result = await response.json();
    return result;
  } catch (error:  any) {
    console.error('Strava integration error:', error);
    throw error;
  }
};

