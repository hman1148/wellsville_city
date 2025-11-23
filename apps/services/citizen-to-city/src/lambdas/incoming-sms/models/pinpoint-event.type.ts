import { PinpointEventRecord } from './pinpoint-event-record.type';

export type PinpointEvent = {
  Records?: PinpointEventRecord[];
  originationNumber?: string;
  destinationNumber?: string;
  messageBody?: string;
  messageKeyword?: string;
  inboundMessageId?: string;
};
