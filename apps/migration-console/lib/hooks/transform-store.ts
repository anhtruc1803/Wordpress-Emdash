"use client";

import { create } from "zustand";

interface TransformStoreState {
  selectedItemId?: string;
  setSelectedItemId: (itemId: string) => void;
}

export const useTransformStore = create<TransformStoreState>((set) => ({
  selectedItemId: undefined,
  setSelectedItemId: (selectedItemId) => set({ selectedItemId })
}));
