import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";

export function useCurrentUser() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [loggingIn, setLoggingIn] = useState(true);

  useEffect(() => {
    return getAuth().onAuthStateChanged((user) => {
      setUserId(user?.uid ?? "");
      setEmail(user?.email?.toLowerCase() ?? "");
      setEmailVerified(user?.emailVerified ?? false);
      setLoggingIn(false);
    });
  }, []);

  const recheckUser = () => {
    const user = getAuth().currentUser;
    setUserId(user?.uid ?? "");
    setEmail(user?.email?.toLowerCase() ?? "");
    setEmailVerified(user?.emailVerified ?? false);
  };

  return { userId, email, emailVerified, loggingIn, recheckUser };
}
