"use client";

import axios from "axios";
import { ApiError } from "../errors";
import { toApiError } from "./http";

/**
 * axios for the browser. It talks to this app's own /api/hecate proxy, which adds the session
 * token on the server. A 401 means the session is gone, so the person is sent to sign in.
 */
export const browserHttp = axios.create({ baseURL: "/api/hecate", timeout: 30_000, headers: { Accept: "application/json" } });

browserHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    const e = toApiError(error);
    if (e instanceof ApiError && e.status === 401 && typeof window !== "undefined") {
      // A full page load on purpose: it also discards every cached response from the ended session.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/login?expired=1");
    }
    throw e;
  },
);
