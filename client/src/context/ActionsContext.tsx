import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ActionFilter, ActionFilterType, AddressComponents } from "../types";
import { getMessages } from "../api";
import { useUserContext } from "./UserContext";

interface Action {
  timestamp: string;
  from: string;
  to?: string;
  type: string;
  payload?: string;
  address: AddressComponents;
  toShort?: string;
  fromShort: string;
}

interface ActionsContextType {
  actions: Action[];
  loadActions: () => Promise<void>
  isLoading: boolean;
  filters: ActionFilter[];
  setFilters: Dispatch<SetStateAction<ActionFilter[]>>
  filterMode: ActionFilterType;
  setFilterMode: Dispatch<SetStateAction<ActionFilterType>>
  DefaultFilterMode: ActionFilterType;
}

const UserContext = createContext<ActionsContextType | undefined>(undefined);

interface ActionsProviderProps {
  children: ReactNode;
}

const DefaultFilterMode: ActionFilterType = 'address'

export const ActionsProvider: React.FC<ActionsProviderProps> = ({ children }) => {
  const { firstTimeVisit, pageOwnerAddress } = useUserContext();

  const [actions, setActions] = useState<Action[]>([]);
  const [filterMode, setFilterMode] = useState<"all" | "address" | "hashtag">(
    firstTimeVisit ? 'all' : DefaultFilterMode
  );
  const [isLoading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ActionFilter[]>([])

  useEffect(() => {
    // Drop sub-filters if user select All of <Address> filter
    if (filterMode !== 'hashtag') {
      setFilters([])
    }
  }, [filterMode]);

  const loadActions = useCallback(async () => {
    setLoading(true)
    setActions([])

    try {
      let items: Action[]
      let actionFilters: ActionFilter[] = []
      if (filterMode === "address" && pageOwnerAddress) {
        actionFilters.push({
          type: 'address',
          value: pageOwnerAddress
        })
      } else if (filterMode === 'hashtag' && filters.length > 0) {
        const [{ value }] = filters
        actionFilters.push({
          type: 'hashtag',
          value: value
        })
      }
      console.log('Fetching actions...', actionFilters)
      items = await getMessages(actionFilters);

      setActions(items)
      console.log('Actions loaded:', items)
    } catch (e) {
      console.error('Failed to load messages:', e)
    } finally {
      setLoading(false)
    }
  }, [filterMode, pageOwnerAddress, filters]);

  useEffect(() => {
    loadActions()
  }, [filterMode, pageOwnerAddress, filters, loadActions]);



  const value = useMemo(() => {
    return {
      actions,
      loadActions,
      isLoading,
      filters,
      setFilters,
      filterMode,
      setFilterMode,
      DefaultFilterMode
    } as any;
  }, [
    actions,
    loadActions,
    isLoading,
    filters,
    setFilters,
    filterMode,
    setFilterMode,
  ]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useActionsContext = (): ActionsContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
