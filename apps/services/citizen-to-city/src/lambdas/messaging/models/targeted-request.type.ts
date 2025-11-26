export type TargetedRequest = {
  message: string;
  citizenIds?: string[]; // Send to specific citizen IDs
  phoneNumbers?: string[]; // Send to specific phone numbers
  senderId?: string; // Optional sender ID for SMS
};
