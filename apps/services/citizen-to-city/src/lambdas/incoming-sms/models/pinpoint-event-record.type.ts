export type PinpointEventRecord = {
  eventSource: string;
  eventVersion: string;
  eventTime: string;
  eventName: string;
  messageConfiguration?: {
    body?: string;
    messageType?: string;
  };
  originationNumber?: string;
  destinationNumber?: string;
  messageBody?: string;
  inboundMessageId?: string;
  previousPublishedMessageId?: string;
};
