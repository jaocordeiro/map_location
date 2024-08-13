export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type ButtonProps = {
  title: string;
  handleAction: () => void;
  style: string;
};
