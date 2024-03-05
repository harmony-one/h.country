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
import {useLocation, useNavigate} from "react-router-dom";
import { addMessage } from "../api/firebase";

export const LSAccountKey = "h_country_client_account";
export const LSIsPageVisited = "h_country_page_visited";

interface UserContextType {
  wallet: Wallet | undefined;
  setWallet: Dispatch<SetStateAction<Wallet | undefined>>;
  firstTimeVisit: boolean;
  pageOwnerAddress: string;
  setPageOwnerAddress: (address: string) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

let forceGenerateNewWallet = false

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation();
  const [wallet, setWallet] = useState<Wallet | undefined>(undefined);
  const [pageOwnerAddress, setPageOwnerAddress] = useState<string | undefined>(undefined);

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

    if (location.pathname === "/new") {
      console.log("[user context] /new: forced to generate a new wallet; current wallet will be rewritten");
      forceGenerateNewWallet = true
    }

    if (wallet && !forceGenerateNewWallet) return

    if (privateKeyLS && !forceGenerateNewWallet) {
      try {
        if (privateKeyLS) {
          const data = getWalletFromPrivateKey(privateKeyLS);
          setWallet(data);
          console.log("[user context] Restored blockchain address");
        }
        // navigate('/messages')
      } catch (error) {
        console.error(
          "[user context] Failed to load user wallet from localStorage:",
          error
        );
      }
    } else {
      if(!forceGenerateNewWallet && location.pathname !== '/hash') {
        navigate('/hash')
      }
      var newWallet;
      if (forceGenerateNewWallet) {
          const privateKey = window.location.search.substring(1);
          try {
              newWallet = getWalletFromPrivateKey(privateKey);
              console.log("[user context] /new: retrieved wallet", newWallet.address);
          } catch (error) {
              console.log("[user context] /new: invalid private key; force generate a new wallet");
          }
      }

      if (!newWallet) {
          newWallet = createRandomWallet();
      }
      setWallet(newWallet);

      // send a new user message
      const locationData = {
        latitude: null as number | null,
        longitude: null as number | null,
        address: "No location",
      };
      const addressWithoutPrefix = newWallet.address.slice(2);
      try {
        const [, referrerAddress] = location.pathname.split('/0/')
        addMessage({
          locationData,
          from: addressWithoutPrefix,
          text: "new_user",
          customPayload: {
            referrerAddress
          }
        });
      } catch (error) {
        console.error("Failed to add message: ", error);
      }
      window.localStorage.setItem(LSAccountKey, newWallet.privateKey);
      console.log(
        "[user context] Generated new blockchain address: ",
        newWallet.address
      );
      if (forceGenerateNewWallet) {
        forceGenerateNewWallet = false
        window.location.replace('/hash')
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const value = useMemo(() => {
    return {
      wallet,
      setWallet,
      firstTimeVisit,
      pageOwnerAddress,
      setPageOwnerAddress
    } as any;
  }, [wallet, pageOwnerAddress, firstTimeVisit]);

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
