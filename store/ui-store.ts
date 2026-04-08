import { create } from "zustand";

interface UiStore {
  // Vehicle dialog
  vehicleDialogOpen: boolean;
  editingVehicleId: string | null;
  openVehicleDialog: (id?: string) => void;
  closeVehicleDialog: () => void;

  // Wallet dialog
  walletDialogOpen: boolean;
  editingWalletId: string | null;
  openWalletDialog: (id?: string) => void;
  closeWalletDialog: () => void;

  // Top-up dialog
  topUpDialogOpen: boolean;
  topUpWalletId: string | null;
  openTopUpDialog: (walletId: string) => void;
  closeTopUpDialog: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  vehicleDialogOpen: false,
  editingVehicleId: null,
  openVehicleDialog: (id) =>
    set({ vehicleDialogOpen: true, editingVehicleId: id ?? null }),
  closeVehicleDialog: () =>
    set({ vehicleDialogOpen: false, editingVehicleId: null }),

  walletDialogOpen: false,
  editingWalletId: null,
  openWalletDialog: (id) =>
    set({ walletDialogOpen: true, editingWalletId: id ?? null }),
  closeWalletDialog: () =>
    set({ walletDialogOpen: false, editingWalletId: null }),

  topUpDialogOpen: false,
  topUpWalletId: null,
  openTopUpDialog: (walletId) =>
    set({ topUpDialogOpen: true, topUpWalletId: walletId }),
  closeTopUpDialog: () =>
    set({ topUpDialogOpen: false, topUpWalletId: null }),
}));
