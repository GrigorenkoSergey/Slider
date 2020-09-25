interface ISubscriber {
  update: (eventType: string, data: any) => void;
}

export {ISubscriber};
