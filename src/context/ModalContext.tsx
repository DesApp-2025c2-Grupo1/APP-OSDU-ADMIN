import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ModalContextValue = {
  modalCount: number;
  isModalOpen: boolean;
  setModalPresence: (id: string, open: boolean) => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [openModals, setOpenModals] = useState<Set<string>>(() => new Set());

  const setModalPresence = useCallback((id: string, open: boolean) => {
    setOpenModals((current) => {
      const alreadyOpen = current.has(id);
      if (alreadyOpen === open) return current;

      const next = new Set(current);
      if (open) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      modalCount: openModals.size,
      isModalOpen: openModals.size > 0,
      setModalPresence,
    }),
    [openModals.size, setModalPresence]
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModalState() {
  const context = useContext(ModalContext);

  if (!context) {
    return {
      modalCount: 0,
      isModalOpen: false,
      setModalPresence: () => undefined,
    };
  }

  return context;
}

export function useModalPresence(id: string, open: boolean) {
  const { setModalPresence } = useModalState();

  useEffect(() => {
    setModalPresence(id, open);
    return () => setModalPresence(id, false);
  }, [id, open, setModalPresence]);
}
