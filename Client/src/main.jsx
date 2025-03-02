import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { PostHogProvider } from "posthog-js/react";

const options = {
  api_host: import.meta.env.REACT_APP_PUBLIC_POSTHOG_HOST,
  autocapture: true,
  disable_session_recording: import.meta.env.NODE_ENV === "development", 
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.REACT_APP_PUBLIC_POSTHOG_KEY}
      options={options}
    >
      <App />
    </PostHogProvider>
  </StrictMode>
);
