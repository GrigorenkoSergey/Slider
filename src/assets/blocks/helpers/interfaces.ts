export interface ISubscriber {
  update: <T>(eventType: string, data: T) => void;
}
