
import { useState } from "react";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";

import { auth } from "./firebase.js";
import { db } from "./firestore.js";
import "./Auth.css";

function Auth() {
  const [page, setPage] = useState("login");
  const [role, setRole] = useState("Donor");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("");

  // SIGN UP
  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    if (!name.trim()) {
      setMessage("Please enter your full name.");
      return;
    }

    try {
      setLoading(true);

      const result = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // Save profile in Firestore
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        name: name.trim(),
        email: result.user.email,
        role: role,
        emailVerified: false,
        createdAt: new Date().toISOString()
      });

      // Send verification email
      await sendEmailVerification(result.user);

      await signOut(auth);

      setMessage(
        "Account created! Please check your email and click the verification link before logging in."
      );

      setPage("login");
      setName("");
      setPassword("");
      setConfirmPassword("");

    } catch (error) {
      // A Firebase Auth account may already exist
      // even if saving its Firestore profile failed.
      if (auth.currentUser) {
        await signOut(auth);
      }

      if (error.code === "auth/email-already-in-use") {
        setMessage(
          "This email already has an account. Please login or resend the verification email."
        );
      } else {
        setMessage(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);

      const result = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await result.user.reload();

      if (!result.user.emailVerified) {
        await signOut(auth);
        setMessage(
          "Please verify your email before logging in. Use Resend Verification Email if needed."
        );
        return;
      }

      const userRef = doc(db, "users", result.user.uid);
      const userSnapshot = await getDoc(userRef);

      let userData;

      if (userSnapshot.exists()) {
        userData = userSnapshot.data();

        // Update verification status
        await setDoc(
          userRef,
          { emailVerified: true },
          { merge: true }
        );
      } else {
        // Recover a missing profile for an existing account
        userData = {
          uid: result.user.uid,
          name: result.user.email.split("@")[0],
          email: result.user.email,
          role: role,
          emailVerified: true,
          createdAt: new Date().toISOString()
        };

        await setDoc(userRef, userData);
      }

      setUserRole(userData.role);
      setUser(result.user);
      setMessage("Login successful!");

    } catch (error) {
      if (auth.currentUser) {
        await signOut(auth);
      }

      setMessage(
        error.code === "permission-denied"
          ? "Database permission denied. Please check Firestore Rules."
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // RESEND VERIFICATION EMAIL
  const handleResendVerification = async () => {
    setMessage("");

    if (!email.trim() || !password) {
      setMessage(
        "Enter your email and password first."
      );
      return;
    }

    try {
      setLoading(true);

      const result = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await result.user.reload();

      if (result.user.emailVerified) {
        await signOut(auth);
        setMessage(
          "Your email is already verified. Please login."
        );
        return;
      }

      await sendEmailVerification(result.user);

      await signOut(auth);

      setMessage(
        "Verification email sent! Check your inbox and spam folder."
      );

    } catch (error) {
      setMessage(
        error.code === "auth/too-many-requests"
          ? "Too many attempts. Please wait before trying again."
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // FORGOT PASSWORD
  const handleReset = async () => {
    setMessage("");

    if (!email.trim()) {
      setMessage("Please enter your email address first.");
      return;
    }

    try {
      setLoading(true);

      await sendPasswordResetEmail(auth, email.trim());

      setMessage(
        "Password reset link sent to your email."
      );

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const handleLogout = async () => {
    try {
      await signOut(auth);

      setUser(null);
      setUserRole("");
      setPassword("");
      setMessage("You have logged out successfully.");

    } catch (error) {
      setMessage(error.message);
    }
  };

  // DASHBOARD
  if (user) {
    return (
      <div className="auth-dashboard">
        <h1>Welcome to RE:PLATE!</h1>

        <h2>
          Hello, {user.displayName || user.email}
        </h2>

        <p>Your email has been verified.</p>

        <h3>Account Type: {userRole}</h3>

        <p>
          Welcome to the {userRole} community!
        </p>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }

  // LOGIN AND SIGNUP PAGE
  return (
    <div className="auth-page">

      <div className="auth-left">
        <h1>🌿 RE:PLATE</h1>

        <h2>Share Food, Spread Happiness!</h2>

        <p>
          Join our community and help reduce food waste.
          Together we can make a difference.
        </p>

        <div className="auth-benefits">
          <h3>❤️ Reduce Food Waste</h3>
          <p>Share extra food with people in need.</p>

          <h3>🤝 Support Communities</h3>
          <p>Connect donors, volunteers and receivers.</p>

          <h3>🌍 Make a Difference</h3>
          <p>Help create a better and kinder world.</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">

          <h1>
            {page === "login"
              ? "Welcome Back!"
              : "Create Account"}
          </h1>

          <p>
            {page === "login"
              ? "Sign in to your RE:PLATE account"
              : "Join the RE:PLATE community"}
          </p>

          <div className="role-options">
            {["Donor", "Volunteer", "Receiver"].map((item) => (
              <button
                key={item}
                type="button"
                className={
                  role === item ? "role active" : "role"
                }
                onClick={() => setRole(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <form
            onSubmit={
              page === "login"
                ? handleLogin
                : handleSignup
            }
          >

            {page === "signup" && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {page === "signup" && (
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
              />
            )}

            {page === "login" && (
              <>
                <button
                  type="button"
                  className="forgot"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Forgot Password?
                </button>

                <button
                  type="button"
                  className="forgot"
                  onClick={handleResendVerification}
                  disabled={loading}
                >
                  Resend Verification Email
                </button>
              </>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : page === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>

          </form>

          {message && (
            <div className="auth-message">
              {message}
            </div>
          )}

          <p className="auth-switch">
            {page === "login"
              ? "Don't have an account?"
              : "Already have an account?"}

            <button
              type="button"
              onClick={() => {
                setPage(
                  page === "login" ? "signup" : "login"
                );
                setMessage("");
              }}
            >
              {page === "login" ? "Sign Up" : "Login"}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Auth;
