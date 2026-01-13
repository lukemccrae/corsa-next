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
  "cognito:username": string; // THIS IS THE COGNITO PK
  picture: string;
};

export type Anon = {
  accessKeyId?: string;
  expiration?: Date;
  sessionToken?: string;
  secretAccessKey?: string;
};

export interface GetLiveStreamsArgs {
  streamIds: string[];
}

type UserContextType = {
  user: User | undefined;
  anon: Anon | undefined;
  checkValidAnon: () => boolean;
  setAnonCreds: () => Promise<Anon | undefined>;
  getAnon: () => Promise<Anon>;
  logoutUser: () => Promise<void>;
  loginUser: (event: any) => Promise<unknown>;
  registerUser: (event: any) => Promise<void>;
  maybeRefreshUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (
    email: string,
    code: string,
    newPassword: string
  ) => Promise<void>;
  resetPasswordWithCode: (
    email: string,
    code: string,
    newPassword: string
  ) => Promise<void>;
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

  // Auto-refresh token every 5 minutes if user is logged in
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      await maybeRefreshUser();
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [user]);

  const logoutUser = async () => {
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    setUser(undefined);
  };

  const maybeRefreshUser = async () => {
    if (!user) return;
    const now = Date.now() / 1000;

    // Refresh if token expires in less than 5 minutes
    if (user.exp < now + 300) {
      await refreshUserSession();
    }
  };

  const refreshUserSession = async () => {
    const storedToken = localStorage.getItem("refreshToken");
    const storedUser = localStorage.getItem("user");

    if (!storedToken || !storedUser) {
      console.warn("No refresh token or user found");
      return;
    }

    const decodedUser: CognitoToken = jwtDecode(storedUser);
    const userEmail = decodedUser.email;

    if (!userEmail) {
      console.warn("No user email found");
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
          logoutUser();
          reject(err);
        } else {
          const newIdToken = session.getIdToken().getJwtToken();
          const newRefreshToken = session.getRefreshToken().getToken();

          setUserInStorage(newIdToken);
          localStorage.setItem("refreshToken", newRefreshToken);
          resolve();
        }
      });
    });
  };

  const forgotPassword = async (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: UserPool,
      });

      cognitoUser.forgotPassword({
        onSuccess: () => {
          resolve();
        },
        onFailure: (err) => {
          console.error("Forgot password error:", err);

          // Check if user doesn't exist
          if (typeof err === "object" && err !== null && "code" in err) {
            const code = (err as { code: string }).code;
            if (code === "UserNotFoundException") {
              reject(new Error("No account found with this email address. "));
            } else if (code === "InvalidParameterException") {
              reject(new Error("Invalid email address."));
            } else if (code === "LimitExceededException") {
              reject(new Error("Too many attempts. Please try again later."));
            } else {
              reject(err);
            }
          } else {
            reject(err);
          }
        },
      });
    });
  };

  const resetPassword = async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: UserPool,
      });

      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => {
          resolve();
        },
        onFailure: (err) => {
          console.error("Reset password error:", err);
          reject(err);
        },
      });
    });
  };

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
    return anon.expiration !== undefined && new Date(anon.expiration).getTime() > Date.now();
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
      throw new Error("Email and password are required");
    }

    if (!username) {
      throw new Error("Username is required");
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Registration failed with status ${response.status}`
        );
      }

      const result = await response.json();
      console.log(result, "<< res");
    } catch (e: any) {
      console.error("Registration error:", e);
      throw e;
    }
  };

  const setUserInStorage = (idToken: string) => {
    const decodedToken = jwtDecode<CognitoToken>(idToken);
    const {
      email,
      exp,
      sub,
      preferred_username,
      picture,
      "cognito:username": username,
    } = decodedToken;
    const userId = sub;

    setUser({
      email,
      exp,
      userId,
      idToken,
      preferred_username,
      picture,
      "cognito:username": username,
    });
    localStorage.setItem("user", idToken);
  };

  const loginUser = async (event: any) => {
    const data = new FormData(event.currentTarget);

    const email = data.get("email")?.toString();
    const password = data.get("password")?.toString();

    if (!email || !password) {
      throw new Error("Email and password are required");
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

    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
          const idToken = result.getIdToken().getJwtToken();
          const refreshToken = result.getRefreshToken().getToken();
          localStorage.setItem("refreshToken", refreshToken);
          setUserInStorage(idToken);
          resolve(result);
        },
        onFailure: function (err) {
          console.error("Authentication failure:", err);
          reject(err);
        },
      });
    });
  };

  // Get anonymous credentials, retrieving them if necessary
  const getAnon = async (): Promise<Anon> => {
    if (!checkValidAnon()) {
      const anon = await setAnonCreds();
      return anon as Anon;
    }
    return anon as Anon;
  };

  const getAnonCreds = async (): Promise<AwsCredentialIdentity> => {
    const REGION = "us-west-1";
    const IDENTITY_POOL_ID = "us-west-1:495addf9-156d-41fd-bf55-3c576a9e1c5e";

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
        return creds;
      } else {
        throw new Error("Failed to retrieve valid credentials");
      }
    } catch (error) {
      console.error("Error setting anonymous credentials:", error);
    } finally {
      setIsFetching(false);
    }
  };

  // Add resetPasswordWithCode implementation
  const resetPasswordWithCode = async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<void> => {
    // This implementation is the same as resetPassword
    return resetPassword(email, code, newPassword);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        anon,
        checkValidAnon,
        setAnonCreds,
        getAnon,
        logoutUser,
        loginUser,
        registerUser,
        maybeRefreshUser,
        forgotPassword,
        resetPassword,
        resetPasswordWithCode,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
