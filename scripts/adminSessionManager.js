/**
 * Admin Session Manager
 * Manages admin authentication state across the entire application
 * Provides functions to: set, get, check, and validate admin sessions
 */

const ADMIN_SESSION_KEY = 'nbi_admin_session';
const ADMIN_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

class AdminSessionManager {
    /**
     * Initialize admin session from Firebase auth
     * @param {Object} firebaseUser - User object from Firebase Auth
     * @returns {Object|null} Admin session object or null if invalid
     */
    static async initializeAdminSession(firebaseUser, isAdmin = false) {
        // If no user provided, try to use existing session
        if (!firebaseUser) {
            console.warn('⚠️ No Firebase user provided - checking for existing session');
            const existingSession = this.getAdminSession();
            if (existingSession && existingSession.isAdmin) {
                console.log('✅ Using existing admin session:', existingSession.email);
                return existingSession;
            }
            return null;
        }

        console.log('🔐 Initializing admin session for:', firebaseUser.email);

        // Create session object
        const adminSession = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email,
            photoURL: firebaseUser.photoURL || null,
            emailVerified: firebaseUser.emailVerified,
            isAdmin: Boolean(isAdmin),
            createdAt: Date.now(),
            expiresAt: Date.now() + ADMIN_SESSION_TIMEOUT
        };

        // Store in sessionStorage
        try {
            sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminSession));
            console.log('✅ Admin session stored:', adminSession.email);
        } catch (error) {
            console.error('❌ Failed to store admin session:', error);
        }

        return adminSession;
    }

    /**
     * Get current admin session
     * @returns {Object|null} Admin session if valid, null otherwise
     */
    static getAdminSession() {
        try {
            const sessionStr = sessionStorage.getItem(ADMIN_SESSION_KEY);
            if (!sessionStr) {
                console.log('ℹ️ No admin session found in storage');
                return null;
            }

            const session = JSON.parse(sessionStr);

            // Check if session has expired
            if (Date.now() > session.expiresAt) {
                console.warn('⚠️ Admin session expired');
                AdminSessionManager.clearAdminSession();
                return null;
            }

            return session;
        } catch (error) {
            console.error('❌ Error retrieving admin session:', error);
            return null;
        }
    }

    /**
     * Check if user is currently an admin
     * @returns {boolean} True if user is admin
     */
    static isAdminLoggedIn() {
        const session = this.getAdminSession();
        return session && session.isAdmin === true;
    }

    /**
     * Get admin email (if logged in)
     * @returns {string|null} Admin email or null
     */
    static getAdminEmail() {
        const session = this.getAdminSession();
        return session ? session.email : null;
    }

    /**
     * Update session expiration time (refresh session)
     */
    static refreshAdminSession() {
        const session = this.getAdminSession();
        if (session) {
            session.expiresAt = Date.now() + ADMIN_SESSION_TIMEOUT;
            try {
                sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
                console.log('🔄 Admin session refreshed');
            } catch (error) {
                console.error('❌ Failed to refresh admin session:', error);
            }
        }
    }

    /**
     * Clear admin session (logout)
     */
    static clearAdminSession() {
        try {
            sessionStorage.removeItem(ADMIN_SESSION_KEY);
            console.log('✅ Admin session cleared');
        } catch (error) {
            console.error('❌ Failed to clear admin session:', error);
        }
    }

    /**
     * Ensure admin is logged in, redirect if not
     * @param {string} redirectUrl - URL to redirect to if not admin
     * @returns {Object|null} Admin session if valid
     */
    static requireAdminLogin(redirectUrl = '/LandingPage/SignInAndSignUp/SignIn.html') {
        const session = this.getAdminSession();
        if (!session || !session.isAdmin) {
            console.warn('⚠️ Admin login required, redirecting...');
            window.location.href = redirectUrl;
            return null;
        }
        return session;
    }

    /**
     * Display admin session info in console
     */
    static logSessionInfo() {
        const session = this.getAdminSession();
        if (!session) {
            console.log('ℹ️ No active admin session');
            return;
        }

        console.group('👤 Admin Session Info');
        console.log('📧 Email:', session.email);
        console.log('🆔 UID:', session.uid);
        console.log('👤 Name:', session.displayName);
        console.log('✅ Is Admin:', session.isAdmin);
        console.log('✔️ Email Verified:', session.emailVerified);
        const timeLeft = Math.round((session.expiresAt - Date.now()) / 1000);
        console.log('⏱️ Session expires in:', timeLeft, 'seconds');
        console.groupEnd();
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.AdminSessionManager = AdminSessionManager;
}
