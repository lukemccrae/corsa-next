import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { AwsCredentialIdentity } from "@aws-sdk/types";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

import {
  AuthenticationDetails,
  CognitoRefreshToken,
  CognitoUser,
} from "amazon-cognito-identity-js";
import UserPool from "../UserPool";
import { CognitoToken } from "../types";
import { jwtDecode } from "jwt-decode";
import { domain } from "./domain.context";
import { retrieveUserToken } from "../helpers/token.helper";

type User = {
  email: string;
  userId: string;
  exp: number;
  idToken: string;
  preferred_username: string;
  picture: string;
};

export type Anon = {
  accessKeyId: string;
  expiration: Date;
  sessionToken: string;
  secretAccessKey: string;
};

export interface GetLiveStreamsArgs {
  streamIds: string[];
}

type UserContextType = {
  user: User | undefined;
  anon: Anon | undefined;
  checkValidAnon: () => boolean;
  setAnonCreds: () => Promise<void>;
  getAnon: () => Promise<Anon>;
  logoutUser: () => Promise<void>;
  loginUser: (event: any) => Promise<void>;
  registerUser: (event: any) => Promise<void>;
  maybeRefreshUser: () => Promise<void>;
  // signInWithFacebook: (provider: string) => Promise<void>;
  // signInWithGoogle: (provider: string) => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// Custom hook to access the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

// Define props for the UserProvider
type UserProviderProps = {
  children: ReactNode;
};

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [anon, setAnon] = useState<Anon | undefined>(undefined);
  const [isFetching, setIsFetching] = useState(false);

  // On mount, load credentials from localStorage or fetch fresh ones
  useEffect(() => {
    const localAnonCreds = localStorage.getItem("anon");
    const localUserCreds = localStorage.getItem("user");

    if (localUserCreds) {
      const decodedUser: CognitoToken = jwtDecode(localUserCreds);
      if (checkValidUser(decodedUser)) {
        setUserInStorage(localUserCreds);
      } else {
        refreshUserSession();
      }
    }

    if (localAnonCreds) {
      const parsedAnon: Anon = JSON.parse(localAnonCreds);
      setAnon(parsedAnon);
    }

    if (!checkValidAnon()) {
      retrieveAnon();
    }
  }, []);

  const logoutUser = async () => {
    localStorage.removeItem("user");
    setUser(undefined);
  };

  const maybeRefreshUser = async () => {
    if (!user) return;
    const now = Date.now() / 1000;

    if (user.exp < now + 60) {
      await refreshUserSession();
    }
  };

  const refreshUserSession = async () => {
    const storedToken = localStorage.getItem("refreshToken");
    const userEmail = user?.email;

    if (!storedToken || !userEmail) {
      console.warn("No refresh token or user email found");
      return;
    }

    const cognitoUser = new CognitoUser({
      Username: userEmail,
      Pool: UserPool,
    });

    const refreshToken = new CognitoRefreshToken({
      RefreshToken: storedToken,
    });

    return new Promise<void>((resolve, reject) => {
      cognitoUser.refreshSession(refreshToken, (err, session) => {
        if (err) {
          console.error("Error refreshing session", err);
          logoutUser(); // Optional
          reject(err);
        } else {
          const newIdToken = session.getIdToken().getJwtToken();
          const newRefreshToken = session.getRefreshToken().getToken();

          setUserInStorage(newIdToken);
          localStorage.setItem("refreshToken", newRefreshToken); // ✅ refresh token might rotate
          resolve();
        }
      });
    });
  };

  // const signInWithGoogle = async (provider: string) => {
  //   try {
  //     // In v6, you use signInWithRedirect with a provider
  //     const result = await signInWithRedirect({
  //       provider: 'Google',
  //     });
  //     console.log(result, 'google result');
  //   } catch (error) {
  //     console.error(`Error signing in with ${provider}:`, error);
  //   }
  // };

  // const signInWithFacebook = async () => {
  //   try {
  //     // You can optionally pass custom state to be received later
  //     const customState = { returnTo: window.location.pathname };

  //     // Initiate the sign-in redirect to Facebook
  //     await signInWithRedirect({
  //       provider: 'Facebook',
  //       customState: JSON.stringify(customState)
  //     });

  //     // Note: The page will redirect, so code after this won't execute immediately
  //     console.log('Redirecting to Facebook login...');
  //   } catch (error) {
  //     console.error('Error starting Facebook sign-in:', error);
  //   }
  // };

  const checkValidUser = (decodedUser: CognitoToken) => {
    if (!decodedUser) return false;
    if (decodedUser.exp < Date.now() / 1000) return false;
    return true;
  };

  // Check if anonymous credentials are still valid
  const checkValidAnon = (): boolean => {
    if (!anon) return false;
    if (!anon.accessKeyId || !anon.secretAccessKey || !anon.sessionToken)
      return false;
    return new Date(anon.expiration).getTime() > Date.now();
  };

  // Retrieve new anonymous credentials
  const retrieveAnon = async () => {
    if (!isFetching) {
      await setAnonCreds();
    }
  };

  const registerUser = async (event: any) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const email = data.get("registerEmail")?.toString();
    const password = data.get("registerPassword")?.toString();
    const bio = data.get("bio")?.toString();
    const username = data.get("username")?.toString();
    const pictureUrl = data.get("pictureUrl")?.toString();
    const firstName = data.get("firstName")?.toString();
    const lastName = data.get("lastName")?.toString();

    if (!email || !password) {
      throw new Error("Your user credentials are invalid");
    }

    try {
      const response = await fetch(`${domain.utilityApi}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${retrieveUserToken()}`,
        },
        body: JSON.stringify({
          email,
          password,
          bio,
          username,
          pictureUrl,
          firstName,
          lastName,
        }),
      });
      console.log(response, "<< res");
      if (!response.ok) {
        throw new Error("Failed to register user");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const setUserInStorage = (idToken: string) => {
    const decodedToken = jwtDecode(idToken) as CognitoToken;
    const { email, exp, sub, preferred_username, picture } = decodedToken;
    const userId = sub;

    setUser({ email, exp, userId, idToken, preferred_username, picture });
    localStorage.setItem("user", idToken);
  };

  const loginUser = async (event: any) => {
    console.log(event, "<< ev");
    const data = new FormData(event.currentTarget);

    const email = data.get("email")?.toString();
    const password = data.get("password")?.toString();

    if (!email || !password) {
      throw new Error("Your user credentials are invalid");
    }

    event.preventDefault();
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });
    var userData = {
      Username: email,
      Pool: UserPool,
    };
    var cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        const idToken = result.getIdToken().getJwtToken();
        const refreshToken = result.getRefreshToken().getToken();
        localStorage.setItem("refreshToken", refreshToken);

        setUserInStorage(idToken);
      },
      onFailure: function (err) {
        console.log(err, "auth failure");
      },
    });
  };

  // Get anonymous credentials, retrieving them if necessary
  const getAnon = async (): Promise<Anon> => {
    if (!checkValidAnon()) {
      await setAnonCreds();
    }
    if (!anon) {
      throw new Error("Failed to retrieve valid anonymous credentials.");
    }
    return anon;
  };

  const getAnonCreds = async (): Promise<AwsCredentialIdentity> => {
    const REGION = "us-west-1";
    const IDENTITY_POOL_ID = "us-west-1:927abfba-eb3c-4fd6-a801-734ee9a4280e";

    const credentialsProvider = fromCognitoIdentityPool({
      identityPoolId: IDENTITY_POOL_ID,
      clientConfig: { region: REGION },
    });

    try {
      const credentials = await credentialsProvider();
      return credentials;
    } catch (error) {
      console.error("Error getting anonymous credentials:", error);
      throw new Error("Failed to fetch anonymous credentials");
    }
  };

  // Function to store and set the credentials
  const setAnonCreds = async () => {
    try {
      setIsFetching(true);

      const anonCreds = await getAnonCreds();
      if (
        anonCreds &&
        anonCreds.expiration &&
        anonCreds.sessionToken &&
        anonCreds.accessKeyId &&
        anonCreds.secretAccessKey
      ) {
        const creds: Anon = {
          expiration: anonCreds.expiration,
          sessionToken: anonCreds.sessionToken,
          secretAccessKey: anonCreds.secretAccessKey,
          accessKeyId: anonCreds.accessKeyId,
        };

        setAnon(creds);
        localStorage.setItem("anon", JSON.stringify(creds));
      } else {
        throw new Error("Failed to retrieve valid credentials");
      }
    } catch (error) {
      console.error("Error setting anonymous credentials:", error);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        // signInWithFacebook,
        // signInWithGoogle,
        maybeRefreshUser,
        user,
        anon,
        registerUser,
        loginUser,
        checkValidAnon,
        setAnonCreds,
        getAnon,
        logoutUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
