import { useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../services/apiConfig";

const API_URL = `${API_BASE_URL}/session/activity`;
const ACTIVITY_INTERVAL = 30000; // 30 seconds
const INACTIVITY_TIMEOUT = 3 * 60 * 1000; // 3 minutes

export default function useSessionActivity() {
  useEffect(() => {
    let lastActivitySent = Date.now();
let lastUserActivity = Date.now();

const handleLoginSuccess = () => {
  lastUserActivity = Date.now();
  lastActivitySent = Date.now();
};

window.addEventListener("shopsphere-auth-change", handleLoginSuccess);

const logout = () => {
  sessionStorage.removeItem("shopsphere_token");
  sessionStorage.removeItem("shopsphere_user");

  window.dispatchEvent(new Event("shopsphere-auth-change"));
  window.location.replace("/login");
};

const checkInactivity = () => {
  const token = sessionStorage.getItem("shopsphere_token");

  if (!token) return;

  if (Date.now() - lastUserActivity >= INACTIVITY_TIMEOUT) {
    logout();
  }
};

const inactivityChecker = setInterval(checkInactivity, 1000);

    const handleActivity = async () => {
  const token = sessionStorage.getItem("shopsphere_token");

  if (!token) return;

  // Do not revive an expired session
  if (Date.now() - lastUserActivity >= INACTIVITY_TIMEOUT) {
    logout();
    return;
  }

  // Reset inactivity time whenever the user interacts
  lastUserActivity = Date.now();

      const now = Date.now();

      // Avoid sending requests on every scroll or click
      if (now - lastActivitySent < ACTIVITY_INTERVAL) return;

      lastActivitySent = now;

      try {
        await axios.post(
          API_URL,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
      } catch (error) {
        if (error.response?.status === 401 ||
            error.response?.status === 403) {
          sessionStorage.removeItem("shopsphere_token");
          sessionStorage.removeItem("shopsphere_user");

          window.dispatchEvent(
            new Event("shopsphere-auth-change")
          );
        }
      }
    };

    const events = ["click", "keydown", "scroll", "input", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
  clearInterval(inactivityChecker);

  window.removeEventListener(
    "shopsphere-auth-change",
    handleLoginSuccess
  );

  events.forEach((event) => {
    window.removeEventListener(event, handleActivity);
  });
};
  }, []);
}
