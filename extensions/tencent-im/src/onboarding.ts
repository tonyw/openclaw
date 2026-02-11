import type { ChannelOnboardingAdapter, ClawdbotConfig } from "openclaw/plugin-sdk";
import { DEFAULT_ACCOUNT_ID } from "openclaw/plugin-sdk";

export type TencentOnboardingState = {
  step: "sdkAppId" | "secretKey" | "userId" | "userSig" | "complete";
  sdkAppId?: string;
  secretKey?: string;
  userId?: string;
  userSig?: string;
};

export const tencentOnboardingAdapter: ChannelOnboardingAdapter<TencentOnboardingState> = {
  initialState: {
    step: "sdkAppId",
  },

  async processMessage({ message, state }) {
    const text = message.text?.trim() ?? "";

    switch (state.step) {
      case "sdkAppId":
        if (/^\d+$/.test(text)) {
          return {
            response:
              "SDKAppID saved. Now please enter your Secret Key (or type 'skip' if not needed):",
            state: { step: "secretKey", sdkAppId: text },
          };
        }
        return {
          response: "Please enter a valid SDKAppID (numeric only):",
          state,
        };

      case "secretKey":
        return {
          response: "Secret Key saved. Now please enter your Bot User ID:",
          state: { ...state, step: "userId", secretKey: text === "skip" ? undefined : text },
        };

      case "userId":
        if (text.length > 0) {
          return {
            response:
              "User ID saved. Now please enter your UserSig (generated from your Secret Key and User ID):",
            state: { ...state, step: "userSig", userId: text },
          };
        }
        return {
          response: "Please enter a valid User ID:",
          state,
        };

      case "userSig":
        if (text.length > 0) {
          return {
            response: "Setup complete! Tencent IM is now configured. Enable it with /enable.",
            state: { ...state, step: "complete", userSig: text },
            complete: true,
          };
        }
        return {
          response: "Please enter a valid UserSig:",
          state,
        };

      case "complete":
        return {
          response: "Setup is already complete. You can reconfigure by starting over.",
          state,
          complete: true,
        };
    }
  },

  buildConfig({ state, cfg }) {
    if (state.step !== "complete") {
      return cfg;
    }

    return {
      ...cfg,
      channels: {
        ...cfg.channels,
        "tencent-im": {
          ...((cfg.channels as Record<string, unknown> | undefined)?.["tencent-im"] as
            | object
            | undefined),
          enabled: true,
          sdkAppId: state.sdkAppId,
          secretKey: state.secretKey,
          userId: state.userId,
          userSig: state.userSig,
        },
      },
    };
  },

  getStatusMessage({ state }) {
    switch (state.step) {
      case "sdkAppId":
        return "Waiting for SDKAppID...";
      case "secretKey":
        return "Waiting for Secret Key...";
      case "userId":
        return "Waiting for User ID...";
      case "userSig":
        return "Waiting for UserSig...";
      case "complete":
        return "Setup complete!";
    }
  },
};
