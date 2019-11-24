export interface Machine {
  isSubscribed: boolean;
  id: string;
  name: string;
  running: boolean;
  status: string;
  room_id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  remainingTime: number;
  vacantTime: number;
}
