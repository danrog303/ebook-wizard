import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {Amplify} from 'aws-amplify';
import {
    AuthUser,
    confirmResetPassword,
    confirmSignUp,
    fetchAuthSession,
    fetchUserAttributes,
    getCurrentUser,
    resendSignUpCode,
    resetPassword,
    signIn,
    signOut,
    signUp
} from "@aws-amplify/auth";
import env from "../../environments/environment";

export interface AuthenticatedUser {
    email: string;
    nickname: string;
}

@Injectable({providedIn: 'root'})
export default class AuthenticationService {
    public $isUserAuthenticated: BehaviorSubject<boolean>;
    public $authenticatedUser: BehaviorSubject<AuthenticatedUser | null>;

    constructor() {
        this.$isUserAuthenticated = new BehaviorSubject<boolean>(false);
        this.$authenticatedUser = new BehaviorSubject<AuthenticatedUser | null>(null);
        Amplify.configure({
            Auth: {
                Cognito: {
                    userPoolId: env.COGNITO_USER_POOL_ID,
                    userPoolClientId: env.COGNITO_PUBLIC_CLIENT_ID,
                }
            }
        });

        getCurrentUser().then((user: AuthUser) => {
            if (user) {
                this.$isUserAuthenticated.next(true);
            }
        }).catch(() => {
            this.$isUserAuthenticated.next(false);
            this.$authenticatedUser.next(null);
        });
    }

    public async isUserAuthenticated(): Promise<boolean> {
        try {
            await getCurrentUser();
            return true;
        } catch {
            return false;
        }
    }

    public async getAccessJwtToken(): Promise<string | undefined> {
        try {
            const authSession = await fetchAuthSession();
            return authSession.tokens?.accessToken.toString();
        } catch {
            return Promise.resolve(undefined);
        }
    }

    public async getUserId(): Promise<string | undefined> {
        try {
            const user = await getCurrentUser();
            return user.username;
        } catch {
            return Promise.resolve(undefined);
        }
    }

    public async signUp(email: string, nickname: string, password: string): Promise<boolean> {
        await signUp({
            username: email,
            password: password,
            options: {
                userAttributes: {
                    nickname: nickname
                }
            }
        });
        return true;
    }

    public async confirmSignUp(email: string, confirmationCode: string): Promise<boolean> {
        await confirmSignUp({
            username: email,
            confirmationCode: confirmationCode
        });
        return true;
    }

    public async signIn(email: string, password: string): Promise<boolean> {
        const signInResponse = await signIn({username: email, password: password});
        if (signInResponse.isSignedIn) {
            this.$isUserAuthenticated.next(true);
            const userAttributes = await fetchUserAttributes();
            const authenticatedUser: AuthenticatedUser = {
                email: userAttributes.email!,
                nickname: userAttributes.nickname!
            };
            this.$authenticatedUser.next(authenticatedUser);
            return true;
        } else {
            throw new Error(`Did not sign in. Next step required: ${signInResponse.nextStep.signInStep}`);
        }
    }

    public async fetchAuthenticatedUser(): Promise<AuthenticatedUser | null> {
        const userAttributes = await fetchUserAttributes();
        if (userAttributes) {
            return {
                email: userAttributes.email!,
                nickname: userAttributes.nickname!
            };
        } else {
            return null;
        }
    }

    public async signOut(): Promise<boolean> {
        await signOut();
        this.$isUserAuthenticated.next(false);
        this.$authenticatedUser.next(null);
        return true;
    }

    public async resendSignUpConfirmationCode(email: string): Promise<boolean> {
        await resendSignUpCode({username: email});
        return true;
    }

    public async resetPassword(email: string): Promise<boolean> {
        await resetPassword({username: email});
        return true;
    }

    public async confirmResetPassword(email: string, code: string, newPassword: string): Promise<boolean> {
        await confirmResetPassword({username: email, newPassword: newPassword, confirmationCode: code});
        return true;
    }
}
