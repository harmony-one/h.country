import React, { useMemo, Suspense } from "react";
import { Box, Text } from "grommet"; // Spinner,
import styled from "styled-components";

import { useActionsContext } from "../../context";
import { isValidAddress } from "../../utils/user";
import { useUserContext } from "../../context";

import { HeaderList } from "./headerList";
import { PlainButton, PlainText } from "../../components/button";
import {
  LocationFilter,
  useIsUserPage,
  useTopLocations,
  useTopTags,
  useUrls,
} from "./hooks";
import { ReactionsProvider } from "../../context/ReactionsContext";
import UserActionSkeleton from "../../components/action/UserActionSkeleton";
import UserAction from "../../components/action";

const UserPageBox = styled(Box)`
  .filter-panel {
    margin-top: 10px;
    margin-bottom: 5px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    text-align: center;
  }
`;

export const UserPage = (props: { id: string }) => {
  const { wallet } = useUserContext();
  const { id: key } = props;
  const tagItems = useTopTags();
  const locationItems = useTopLocations();
  const urls = useUrls();
  const isUserPage = useIsUserPage();
  const {
    actions,
    filters,
    setFilters,
    filterMode,
    setFilterMode,
    DefaultFilterMode,
    isLoading,
  } = useActionsContext();

  const indexedUrls = useMemo(
    () => urls.map((u, i) => ({ ...u, index: i })),
    [urls]
  );

  const indexedItems = useMemo(
    () => [
      // to be displayed in column 1,2
      ...tagItems.slice(0, 6).map((item, idx) => ({ ...item, index: idx })),
      // to be displayed in column 3
      ...locationItems.map((item, idx) => ({ ...item, index: 6 + idx })),
    ],
    [tagItems, locationItems]
  );

  if (!key || !isValidAddress(key)) {
    return <Box>Not a valid user ID</Box>;
  }

  const onTagClicked = (hashtag: string) => {
    if (!filters.find((item) => item.value === hashtag)) {
      setFilters([
        ...filters,
        {
          type: "hashtag",
          value: hashtag,
        },
      ]);
      setFilterMode("hashtag");
    }
  };

  const onLocationClicked = (location: string) => {
    if (!filters.find((item) => item.value === location)) {
      setFilters([
        ...filters,
        {
          type: "location",
          value: location,
        },
      ]);
      setFilterMode("location");
    }
  };

  const headerListProps = {
    userId: key,
    isLoading,
    isUserPage,
    wallet,
  };
  function loadActions(lastVisible: any) {
    throw new Error("Function not implemented.");
  }

  return (
    <UserPageBox>
      <Box gap={"16px"} pad={"2px 16px"}>
        <HeaderList {...headerListProps} type={"url"} items={indexedUrls} />
        <HeaderList
          {...headerListProps}
          type={"hashtag"}
          items={indexedItems}
        />
      </Box>
      <div className="filter-panel">
        <Box direction={"row"}>
          <PlainButton
            isActive={filterMode === "all"}
            onClick={() => setFilterMode("all")}
          >
            <PlainText fontSize="min(1em, 4vw)">all</PlainText>
          </PlainButton>
          <PlainButton
            isActive={filterMode === "address"}
            onClick={() => setFilterMode("address")}
          >
            <PlainText fontSize="min(1em, 4vw)">
              0/{key?.substring(0, 4)}
            </PlainText>
          </PlainButton>
          {filters
            .filter((f) => f.value !== "one" && f.value !== "ai")
            .map((filter) => {
              const { value, type } = filter;
              const onClick = () => {
                const newFilters = filters.filter(
                  (item) => item.value !== value
                );

                setFilters(newFilters);
                setFilterMode(newFilters[0]?.type || DefaultFilterMode);
              };
              return type === "location" ? (
                <Box>
                  <LocationFilter
                    address={value}
                    onClick={onClick}
                    latestLocation={actions[0]?.address}
                  />
                </Box>
              ) : (
                <PlainButton
                  key={value}
                  isActive={filters.length > 0}
                  onClick={onClick}
                >
                  <PlainText color={isUserPage ? "blue1" : "yellow1"}>
                    #{value}
                  </PlainText>
                </PlainButton>
              );
            })}
        </Box>
        <Box direction={"row"} alignSelf="center" alignContent="around">
          <PlainButton
            isActive={filterMode === "hashtag"}
            onClick={() => {
              if (filters.find((item) => item.value === "one")) {
                const newFilters = filters.filter(
                  (item) => item.value !== "one"
                );
                setFilters(newFilters);
              } else {
                setFilters([
                  ...filters,
                  {
                    type: "location",
                    value: "one",
                  },
                ]);
                setFilterMode("hashtag");
              }
            }}
          >
            {/* <PlainText fontSize="min(1em, 4vw)">#one</PlainText> */}
          </PlainButton>
          <PlainButton
            isActive={filterMode === "hashtag"}
            onClick={() => {
              if (filters.find((item) => item.value === "ai")) {
                const newFilters = filters.filter(
                  (item) => item.value !== "ai"
                );
                setFilters(newFilters);
              } else {
                setFilters([
                  ...filters,
                  {
                    type: "location",
                    value: "ai",
                  },
                ]);
                setFilterMode("hashtag");
              }
            }}
          >
            {/* <PlainText fontSize="min(1em, 4vw)">#ai</PlainText> */}
          </PlainButton>
          {/* <PlainButton style={{ padding: '2px' }}>
            <PlainText fontSize="min(1em, 4vw)">
              <StarOutlined />
            </PlainText>
          </PlainButton> */}
        </Box>
      </div>
      <Box>
        {/* {isLoading && (
          <Box align={"center"}>
            <Spinner color={"spinner"} />
          </Box>
        )} */}
        {!isLoading && actions.length === 0 && (
          <Box align={"center"}>
            <Text color="grey1">No actions found</Text>
          </Box>
        )}
        <ReactionsProvider>
          <InfiniteScroll
            dataLength={actions.length}
            next={() => {
              loadActions(lastVisible)
            }}
            inverse={true}
            hasMore={true}
            loader={''}
          // scrollThreshold="200px"
          >
            {actions.map((action, index) => {
              // const id = getUniqueId(action) // now using doc id.
              return (
                <Suspense key={index} fallback={<UserActionSkeleton />}>
                  <UserAction
                    userId={key}
                    index={action.id} // index + action.timestamp}
                    key={action.id} // {index + action.timestamp}
                    action={action}
                    onTagClicked={onTagClicked}
                    onLocationClicked={onLocationClicked}
                  />
                </Suspense>
              )
            })}
        </ReactionsProvider>
      </Box>
    </UserPageBox>
  );
};
