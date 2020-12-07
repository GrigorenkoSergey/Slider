export interface ISubscriber {
  update: (eventType: string, data: any) => void;
}
