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
import { getMessages, genFilter, IFilter } from "../api";
import { useUserContext } from "./UserContext";
import {  Unsubscribe } from 'firebase/firestore';

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

const DefaultFilterMode: ActionFilterType = 'all'

export const ActionsProvider: React.FC<ActionsProviderProps> = ({ children }) => {
  const { firstTimeVisit, pageOwnerAddress } = useUserContext();

  const [actions, setActions] = useState<Action[]>([]);
  const [filterMode, setFilterMode] = useState<ActionFilterType>(
    firstTimeVisit ? 'all' : DefaultFilterMode
  );
  const [isLoading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ActionFilter[]>([])
  const [unsubscribeUpdates, setUnsubscribeUpdates] = useState<Unsubscribe[]>([])

  useEffect(() => {
    // Drop sub-filters if user select All of <Address> filter
    if (!['hashtag', 'location'].includes(filterMode)) {
      setFilters([])
    }
  }, [filterMode]);

  const loadActions = useCallback(async () => {
    setLoading(true)
    setActions([])

    // Unsubscribe from previous updates
    // console.log(`Unsubscribe from ${unsubscribeUpdates.length} updates`)
    unsubscribeUpdates.forEach(unsubscribe => {
      unsubscribe()
    })

    try {
      let actionFilters: IFilter[] = []
      if (filterMode === "address" && pageOwnerAddress) {
        actionFilters = [
          genFilter('from', '==', pageOwnerAddress),
          genFilter('to', '==', pageOwnerAddress)
        ]
      } else if (filterMode === 'location' && filters.length > 0) {
        const [{ value }] = filters
        actionFilters = [
          genFilter('payload', '==', value),
          genFilter('address.short', '==', value)
        ]
      } else if (filterMode === 'hashtag' && filters.length > 0) {
        const [{ value }] = filters
        actionFilters = [
          genFilter('payload', '==', value),
        ]
      }
      console.log('Fetching actions...', actionFilters)
      const data = await getMessages({
        filters: actionFilters,
        updateCallback: (actionsUpdate: Action[]) => {
          setActions(actionsUpdate)
        }
      });

      setActions(data.actions)
      console.log('Actions loaded:', data.actions)
      setUnsubscribeUpdates(data.unsubscribeList)
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
