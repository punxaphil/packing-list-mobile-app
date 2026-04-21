import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";

const APPLE_PROVIDER = "apple.com";

const requiresEmailVerification = () => {
  const user = getAuth().currentUser;
  if (!user) return false;
  if (user.emailVerified) return false;
  return !user.providerData.some((provider) => provider.providerId === APPLE_PROVIDER);
};

export function useCurrentUser() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [loggingIn, setLoggingIn] = useState(true);

  useEffect(() => {
    return getAuth().onAuthStateChanged((user) => {
      setUserId(user?.uid ?? "");
      setEmail(user?.email?.toLowerCase() ?? "");
      setVerificationRequired(requiresEmailVerification());
      setLoggingIn(false);
    });
  }, []);

  const recheckUser = () => {
    const user = getAuth().currentUser;
    setUserId(user?.uid ?? "");
    setEmail(user?.email?.toLowerCase() ?? "");
    setVerificationRequired(requiresEmailVerification());
  };

  return { userId, email, verificationRequired, loggingIn, recheckUser };
}
