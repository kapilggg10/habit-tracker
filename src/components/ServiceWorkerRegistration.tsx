"use client";

import { useEffect, useState } from "react";

export function ServiceWorkerRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Only register in production builds
    if (typeof window === "undefined") {
      return;
    }

    // Skip registration only in Next.js dev mode (not in production builds)
    // This allows testing production builds locally
    if (process.env.NODE_ENV === "development") {
      console.log("[SW] Skipping service worker registration in development");
      return;
    }

    // Check if service workers are supported
    if (!("serviceWorker" in navigator)) {
      console.log("[SW] Service workers not supported");
      return;
    }

    // Track online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      checkForUpdates();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);

    let registration: ServiceWorkerRegistration | null = null;
    let refreshing = false;

    // Register service worker
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        registration = reg;
        console.log("[SW] Service worker registered:", reg.scope);

        // Check for updates immediately
        checkForUpdates();

        // Check for updates periodically when online
        const updateInterval = setInterval(() => {
          if (navigator.onLine) {
            checkForUpdates();
          }
        }, 120000); // Check every two minutes

        // Listen for service worker updates
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          console.log("[SW] New service worker found, installing...");

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New service worker installed, but old one is still active
              console.log("[SW] New service worker installed, update available");
              setUpdateAvailable(true);
            } else if (newWorker.state === "activated") {
              // New service worker activated
              console.log("[SW] New service worker activated");
              setUpdateAvailable(false);
            }
          });
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data?.type === "NEW_VERSION_AVAILABLE") {
            console.log("[SW] New version available:", event.data.version);
            setUpdateAvailable(true);
          }
        });

        return () => clearInterval(updateInterval);
      })
      .catch((error) => {
        console.error("[SW] Service worker registration failed:", error);
      });

    // Check for updates function
    function checkForUpdates() {
      if (!registration || !navigator.onLine) return;

      registration
        .update()
        .then(() => {
            // Also check version.json directly
            if (typeof caches !== "undefined") {
              fetch("/version.json")
                .then((response) => response.json())
                .then((serverVersion) => {
                  // Compare with cached version if available
                  caches.match("/version.json").then((cachedResponse) => {
                    if (cachedResponse) {
                      cachedResponse.json().then((cachedVersion) => {
                        if (
                          compareVersions(
                            serverVersion.version,
                            cachedVersion.version,
                          ) > 0
                        ) {
                          console.log(
                            "[SW] New version detected:",
                            serverVersion.version,
                          );
                          setUpdateAvailable(true);
                        }
                      });
                    }
                  });
                })
                .catch((error) => {
                  console.error("[SW] Failed to check version:", error);
                });
            }
        })
        .catch((error) => {
          console.error("[SW] Failed to update service worker:", error);
        });
    }

    // Handle page refresh when new service worker activates
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      console.log("[SW] New service worker controlling page, reloading...");
      window.location.reload();
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleUpdate = () => {
    if (!navigator.serviceWorker.controller) return;

    // Send message to service worker to skip waiting
    navigator.serviceWorker.controller.postMessage({ type: "SKIP_WAITING" });

    // Reload the page
    window.location.reload();
  };

  // Compare version strings (semantic versioning)
  function compareVersions(version1: string, version2: string): number {
    const v1parts = version1.split(".").map(Number);
    const v2parts = version2.split(".").map(Number);

    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;

      if (v1part > v2part) return 1;
      if (v1part < v2part) return -1;
    }

    return 0;
  }

  // Don't render anything in production (service worker runs in background)
  // Only show update notification if update is available
  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-fade-in">
      <div className="rounded-xl bg-white p-4 shadow-2xl dark:bg-gray-800">
        <div className="mb-2 flex items-center gap-2">
          <svg
            className="h-5 w-5 text-blue-600 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">
            Update Available
          </h3>
        </div>
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          A new version of the app is available. Update now to get the latest
          features.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
          >
            Update Now
          </button>
          <button
            onClick={() => setUpdateAvailable(false)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

