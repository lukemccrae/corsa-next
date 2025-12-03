import { CognitoUserPool } from 'amazon-cognito-identity-js';

// TODO: obsiously bad
const poolData = {
  UserPoolId: 'us-west-1_wUiHrQ9XE',
  ClientId: 'k620utq33v71qa3jrdc8jpd5r'
};

export default new CognitoUserPool(poolData);
