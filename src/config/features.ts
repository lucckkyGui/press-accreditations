export const features = {
  aiFraud: import.meta.env.VITE_FEATURE_AI_FRAUD === "true",
  blockchain: import.meta.env.VITE_FEATURE_BLOCKCHAIN === "true",
  faceRecognition: import.meta.env.VITE_FEATURE_FACE_RECOGNITION === "true",
  landingPageBuilder: import.meta.env.VITE_FEATURE_LANDING_PAGE_BUILDER === "true",
  marketplace: import.meta.env.VITE_FEATURE_MARKETPLACE === "true",
  rfid: import.meta.env.VITE_FEATURE_RFID === "true",
  whiteLabel: import.meta.env.VITE_FEATURE_WHITE_LABEL === "true",
  wristbands: import.meta.env.VITE_FEATURE_WRISTBANDS === "true",
} as const;
