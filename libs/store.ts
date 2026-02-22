import { create } from 'zustand';
import { auth, db } from './firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updatePassword,
    User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type Role = 'patient' | 'caregiver';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: Role;
    inviteCode: string;
    notificationSounds?: boolean;
}

interface AuthState {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    initialized: boolean;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    setUser: (user: User | null) => void;
    setProfile: (profile: UserProfile | null) => void;
    login: (email: string, pass: string) => Promise<void>;
    register: (email: string, pass: string, name: string, role: Role) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateProfileName: (newName: string) => Promise<void>;
    updateUserPassword: (newPass: string) => Promise<void>;
    toggleNotificationSounds: (enabled: boolean) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    profile: null,
    loading: false,
    initialized: false,
    theme: 'light',

    setTheme: (theme) => set({ theme }),
    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),

    login: async (email, pass) => {
        set({ loading: true });
        console.log('[Auth] Attempting login for:', email);
        try {
            const { user } = await signInWithEmailAndPassword(auth, email, pass);
            console.log('[Auth] Firebase login success. UID:', user.uid);

            const docRef = doc(db, 'Users', user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                console.log('[Auth] Firestore profile found.');
                set({ user, profile: docSnap.data() as UserProfile });
            } else {
                console.warn('[Auth] No Firestore profile found for user!');
                set({ profile: null });
                throw new Error("User profile not found in database.");
            }
        } catch (e) {
            console.error('[Auth] Login error:', e);
            throw e;
        } finally {
            set({ loading: false });
        }
    },

    register: async (email, pass, name, role) => {
        set({ loading: true });
        console.log('[Auth] Attempting registration for:', email, role);
        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, pass);
            console.log('[Auth] Firebase registration success. UID:', user.uid);

            const profile: UserProfile = {
                id: user.uid,
                name,
                email,
                role,
                inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            };

            console.log('[Auth] Creating Firestore profile...');
            await setDoc(doc(db, 'Users', user.uid), profile);
            console.log('[Auth] Profile created successfully.');

            // Set session directly so they are immediately logged in
            set({ user, profile });
        } catch (e) {
            console.error('[Auth] Registration error:', e);
            throw e;
        } finally {
            set({ loading: false });
        }
    },

    logout: async () => {
        set({ loading: true });
        console.log('[Auth] Attempting logout...');
        try {
            await signOut(auth);
            console.log('[Auth] Firebase logout success.');
            set({ user: null, profile: null });
        } catch (e) {
            console.error('[Auth] Logout error', e);
        } finally {
            set({ loading: false });
        }
    },

    resetPassword: async (email) => {
        set({ loading: true });
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (e) {
            console.error('[Auth] Password reset error', e);
            throw e;
        } finally {
            set({ loading: false });
        }
    },

    updateProfileName: async (newName: string) => {
        const { user, profile } = get();
        if (!user || !profile) return;
        try {
            await setDoc(doc(db, 'Users', user.uid), { name: newName }, { merge: true });
            set({ profile: { ...profile, name: newName } });
        } catch (e) {
            console.error('[Auth] update name error', e);
            throw e;
        }
    },

    updateUserPassword: async (newPass: string) => {
        const { user } = get();
        if (!user) return;
        try {
            await updatePassword(user, newPass);
        } catch (e: any) {
            console.error('[Auth] update pass error', e);
            throw e;
        }
    },

    toggleNotificationSounds: async (enabled: boolean) => {
        const { user, profile } = get();
        if (!user || !profile) return;
        try {
            await setDoc(doc(db, 'Users', user.uid), { notificationSounds: enabled }, { merge: true });
            set({ profile: { ...profile, notificationSounds: enabled } });
        } catch (e) {
            console.error('[Auth] toggle sound error', e);
        }
    }
}));

onAuthStateChanged(auth, async (user) => {
    console.log('[Auth] Auth state changed. User exists:', !!user);
    if (user) {
        useAuthStore.setState({ user });
        try {
            const docRef = doc(db, 'Users', user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                console.log('[Auth] Loaded profile from Firestore.');
                useAuthStore.setState({ profile: docSnap.data() as UserProfile });
            } else {
                console.warn('[Auth] Document does not exist for UID:', user.uid);
                useAuthStore.setState({ profile: null });
            }
        } catch (e) {
            console.error('[Auth] Error fetching user profile:', e);
        }
    } else {
        useAuthStore.setState({ user: null, profile: null });
    }
    useAuthStore.setState({ initialized: true });
    console.log('[Auth] Auth state initialized.');
});
