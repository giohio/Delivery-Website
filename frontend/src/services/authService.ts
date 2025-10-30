import { 
  signInWithPopup, 
  signOut, 
  User,
  UserCredential,
  AuthError
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../config/firebase';
const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:5000';

export interface AuthUser {
  email: string;
  fullName: string;
  avatar?: string;
}

// Convert Firebase User to our AuthUser format
export const convertFirebaseUser = (firebaseUser: User): AuthUser => {
  // Handle case when email is not available (e.g., Facebook login without email permission)
  const email = firebaseUser.email || `${firebaseUser.uid}@facebook.user`;
  const fullName = firebaseUser.displayName || 
                   (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Facebook User');
  
  return {
    email: email,
    fullName: fullName,
    avatar: firebaseUser.photoURL || undefined
  };
};

// Handle account linking when account exists with different credential
const handleAccountLinking = async (error: AuthError, currentProvider: string): Promise<never> => {
  // Get the email from the error
  const email = error.customData?.email as string;
  
  if (!email) {
    throw new Error(
      'Tài khoản này đã được đăng ký bằng phương thức khác. ' +
      'Vui lòng thử đăng nhập bằng Google hoặc Facebook (phương thức bạn đã dùng lần đầu).'
    );
  }

  // Provide clear message about the conflict
  const otherProvider = currentProvider === 'Google' ? 'Facebook' : 'Google';
  
  throw new Error(
    `Email "${email}" đã được đăng ký bằng ${otherProvider}. ` +
    `Vui lòng đăng nhập bằng ${otherProvider} thay vì ${currentProvider}.`
  );
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<AuthUser> => {
  try {
    const result: UserCredential = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    const res = await fetch(`${API_BASE}/auth/firebase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: idToken })
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Đăng nhập Firebase thất bại');
    }
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return convertFirebaseUser(result.user);
  } catch (error: any) {
    console.error('Google sign in error:', error);
    
    // Handle account linking error
    if (error.code === 'auth/account-exists-with-different-credential') {
      await handleAccountLinking(error, 'Google');
    }
    
    // Provide user-friendly error messages
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Đăng nhập bị hủy. Vui lòng thử lại.');
    }
    
    throw new Error(error.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.');
  }
};

// Sign in with Facebook
export const signInWithFacebook = async (): Promise<AuthUser> => {
  try {
    const result: UserCredential = await signInWithPopup(auth, facebookProvider);
    const idToken = await result.user.getIdToken();
    const res = await fetch(`${API_BASE}/auth/firebase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: idToken })
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Đăng nhập Firebase thất bại');
    }
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return convertFirebaseUser(result.user);
  } catch (error: any) {
    console.error('Facebook sign in error:', error);
    
    // Handle account linking error
    if (error.code === 'auth/account-exists-with-different-credential') {
      await handleAccountLinking(error, 'Facebook');
    }
    
    // Provide user-friendly error messages
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Đăng nhập bị hủy. Vui lòng thử lại.');
    }
    
    throw new Error(error.message || 'Đăng nhập Facebook thất bại. Vui lòng thử lại.');
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged(callback);
};
