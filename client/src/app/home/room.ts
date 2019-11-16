export interface Room {
  id: string;
  name: string;

  isSubscribed: boolean;

  numberOfAllMachines: number;
  numberOfAvailableMachines: number;
}
