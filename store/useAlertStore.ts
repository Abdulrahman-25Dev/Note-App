import { create } from "zustand";

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface ShowAlertParams {
  title: string;
  message: string;
  buttons?: AlertButton[];
}

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  showAlert: (params: ShowAlertParams) => void;
  hideAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  visible: false,
  title: "",
  message: "",
  buttons: [],
  showAlert: ({ title, message, buttons }) =>
    set({ visible: true, title, message, buttons: buttons ?? [] }),
  hideAlert: () => set({ visible: false }),
}));
