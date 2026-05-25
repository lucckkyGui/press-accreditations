const isFeatureEnabled = (name: string) => import.meta.env[name] === "true";

export const features = {
  aiFraud: isFeatureEnabled("VITE_FEATURE_AI_FRAUD"),
  blockchain: isFeatureEnabled("VITE_FEATURE_BLOCKCHAIN"),
  faceRecognition: isFeatureEnabled("VITE_FEATURE_FACE_RECOGNITION"),
  landingPageBuilder: isFeatureEnabled("VITE_FEATURE_LANDING_PAGE_BUILDER"),
  marketplace: isFeatureEnabled("VITE_FEATURE_MARKETPLACE"),
  rfid: isFeatureEnabled("VITE_FEATURE_RFID"),
  whiteLabel: isFeatureEnabled("VITE_FEATURE_WHITE_LABEL"),
  wristbands: isFeatureEnabled("VITE_FEATURE_WRISTBANDS"),
} as const;
