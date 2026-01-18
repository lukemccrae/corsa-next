import { CognitoUserPool } from 'amazon-cognito-identity-js';

// TODO: obsiously bad
const poolData = {
  UserPoolId: 'us-west-1_wUiHrQ9XE',
  ClientId: '4taoqb3974257dmm681u3p99ej'
};

export default new CognitoUserPool(poolData);
