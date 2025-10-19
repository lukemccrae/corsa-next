import { CognitoUserPool } from 'amazon-cognito-identity-js';

// TODO: obsiously bad
const poolData = {
  UserPoolId: 'us-west-1_S7GEufYHG',
  ClientId: '7kkg4v2ss0llbf36r5qcd5ff9r'
};

export default new CognitoUserPool(poolData);
