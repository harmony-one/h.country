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
import { ActionFilter, ActionFilterMode, AddressComponents } from "../types";
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
  filterMode: ActionFilterMode
  setFilterMode: Dispatch<SetStateAction<ActionFilterMode>>
  DefaultFilterMode: ActionFilterMode;
  lastVisible?: QueryDocumentSnapshot;
}

const UserContext = createContext<ActionsContextType | undefined>(undefined);

interface ActionsProviderProps {
  children: ReactNode;
}

const DefaultFilterMode: ActionFilterMode = 'all'

export const ActionsProvider: React.FC<ActionsProviderProps> = ({ children }) => {
  const { firstTimeVisit, pageOwnerAddress } = useUserContext();

  const [actions, setActions] = useState<Action[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | undefined>();

  const [filterMode, setFilterMode] = useState<ActionFilterMode>(
    firstTimeVisit ? 'all' : DefaultFilterMode
  );
  const [isLoading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ActionFilter[]>([])
  const [unsubscribeUpdates, setUnsubscribeUpdates] = useState<Unsubscribe[]>([])

  const loadActions = useCallback(async (lastVisible?: QueryDocumentSnapshot) => {
    setLoading(true)

    // Unsubscribe from previous updates
    // console.log(`Unsubscribe from ${unsubscribeUpdates.length} updates`)

    if (!lastVisible) {
      unsubscribeUpdates.forEach(unsubscribe => {
        unsubscribe()
      })
    }

    try {
      let allFilters: IFilter[][] = [[]];

      const actionFilters =
        filters.map(f => {
          if (f.type === 'hashtag') {
            return genFilter('payload', '==', f.value)
          } else {
            return genFilter('address.short', '==', f.value)
          }
        })

      if (filterMode === "address" && pageOwnerAddress) {
        allFilters = [
          [...actionFilters, genFilter('from', '==', pageOwnerAddress)],
          [...actionFilters, genFilter('to', '==', pageOwnerAddress)]
        ]
      } else {
        allFilters = [actionFilters]
      }

      console.log('Fetching actions...', allFilters, filterMode)
      const data = await getMessages({
        lastVisible,
        filters: allFilters,
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
