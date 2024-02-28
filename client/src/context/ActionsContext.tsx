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
import { QueryDocumentSnapshot, Unsubscribe } from 'firebase/firestore';

interface Action {
  timestamp: string;
  from: string;
  to?: string;
  type: string;
  payload?: string;
  address: AddressComponents;
  toShort?: string;
  fromShort: string;
  id: string;
}

interface ActionsContextType {
  actions: Action[];
  loadActions: (lastVisible?: QueryDocumentSnapshot) => Promise<void>
  isLoading: boolean;
  filters: ActionFilter[];
  setFilters: Dispatch<SetStateAction<ActionFilter[]>>
  filterMode: ActionFilterType;
  setFilterMode: Dispatch<SetStateAction<ActionFilterType>>
  DefaultFilterMode: ActionFilterType;
  lastVisible?: QueryDocumentSnapshot;
}

const UserContext = createContext<ActionsContextType | undefined>(undefined);

interface ActionsProviderProps {
  children: ReactNode;
}

const DefaultFilterMode: ActionFilterType = 'all'

export const ActionsProvider: React.FC<ActionsProviderProps> = ({ children }) => {
  const { firstTimeVisit, pageOwnerAddress } = useUserContext();

  const [actions, setActions] = useState<Action[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | undefined>();

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

  const loadActions = useCallback(async (lastVisible?: QueryDocumentSnapshot) => {
    setLoading(true)

    // Unsubscribe from previous updates
    // console.log(`Unsubscribe from ${unsubscribeUpdates.length} updates`)
    unsubscribeUpdates.forEach(unsubscribe => {
      unsubscribe()
    })

    try {
      let actionFilters: IFilter[][] = [[]];

      if (filters.length > 1 && ['location', 'hashtag'].includes(filterMode)) {
        actionFilters = [
          filters.map(f => {
            if (f.type === 'hashtag') {
              return genFilter('payload', '==', f.value)
            } else {
              return genFilter('address.short', '==', f.value)
            }
          })
        ]
      } else {
        if (filterMode === "address" && pageOwnerAddress) {
          actionFilters = [
            [genFilter('from', '==', pageOwnerAddress)],
            [genFilter('to', '==', pageOwnerAddress)]
          ]
        } else if (filterMode === 'location' && filters.length > 0) {
          const [{ value }] = filters
          actionFilters = [
            [genFilter('payload', '==', value)],
            [genFilter('address.short', '==', value)]
          ]
        } else if (filterMode === 'hashtag' && filters.length > 0) {
          const [{ value }] = filters
          actionFilters = [
            [genFilter('payload', '==', value)]
          ]
        }
      }

      console.log('Fetching actions...', actionFilters, filterMode)
      const data = await getMessages({
        lastVisible,
        filters: actionFilters,
        size: 200,
        updateCallback: (actionsUpdate: Action[]) => {
          setActions(oldActions => {
            const newActions = actionsUpdate.filter(
              a => !oldActions.find(oA => oA.id === a.id)
            );

            return [...newActions, ...oldActions];
          })
        }
      });

      if (lastVisible) {
        setActions(oldActions => oldActions.concat(data.actions))
      } else {
        setActions(data.actions)
      }

      setLastVisible(data.lastVisible);
      console.log('Actions loaded:', data.actions)
      setUnsubscribeUpdates(data.unsubscribeList)
    } catch (e) {
      console.error('Failed to load messages:', e)
    } finally {
      setLoading(false)
    }
  }, [filterMode, pageOwnerAddress, filters]);

  useEffect(() => {
    setLastVisible(undefined);
    if (pageOwnerAddress) {
      loadActions()
    }
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
      DefaultFilterMode,
      lastVisible
    } as any;
  }, [
    actions,
    loadActions,
    isLoading,
    filters,
    setFilters,
    filterMode,
    setFilterMode,
    lastVisible
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
