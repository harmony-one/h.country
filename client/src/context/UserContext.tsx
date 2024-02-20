import { JsonRpcProvider, Wallet } from "ethers";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { addMessage } from "../api/firebase";

export const LSAccountKey = "h_country_client_account";
export const LSIsPageVisited = "h_country_page_visited";

interface UserContextType {
  wallet: Wallet | undefined;
  setWallet: Dispatch<SetStateAction<Wallet | undefined>>;
  firstTimeVisit: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const location = useLocation();
  const [wallet, setWallet] = useState<Wallet | undefined>(undefined);

  const privateKeyLS = window.localStorage.getItem(LSAccountKey);
  const firstTimeVisit = !window.localStorage.getItem(LSIsPageVisited);

  useEffect(()=> {
    if (firstTimeVisit) {
      setTimeout(() => {
        window.localStorage.setItem(LSIsPageVisited, 'true');
      }, 3000);
    } 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (location.pathname === "/auth" || location.pathname === "/") {
      console.log("[user context] /auth route, special handling");
      // navigate('/messages')
    }

    if (wallet) return
    if (privateKeyLS) {
      try {
        const data = getWalletFromPrivateKey(privateKeyLS);
        setWallet(data);
        console.log(
          "[user context] Restored blockchain wallet from private key: ",
          data.address
        );
        // navigate('/messages')
      } catch (error) {
        console.error(
          "[user context] Failed to load user wallet from localStorage:",
          error
        );
      }
    } else {
      const newWallet = createRandomWallet();
      setWallet(newWallet);

      // send a new user message
      const locationData = {
        latitude: null as number | null,
        longitude: null as number | null,
        address: "No location",
      };
      const addressWithoutPrefix = newWallet.address.slice(2);
      addMessage(locationData, addressWithoutPrefix, "new user joined");
      window.localStorage.setItem(LSAccountKey, newWallet.privateKey);
      console.log(
        "[user context] Generated new blockchain wallet: ",
        newWallet.address
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const value = useMemo(() => {
    return {
      wallet,
      setWallet,
      firstTimeVisit,
    } as any;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

export const createRandomWallet = (): Wallet => {
  const hdWallet = Wallet.createRandom();
  return getWalletFromPrivateKey(hdWallet.privateKey);
};

const getWalletFromPrivateKey = (privateKey: string): Wallet => {
  const provider = new JsonRpcProvider();
  return new Wallet(privateKey, provider);
};
