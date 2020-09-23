export default interface ISubscriber {
  update: (eventType: string, data: any) => void;
}