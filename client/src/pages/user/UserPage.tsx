import React, { useEffect, useMemo } from "react";
import { Box, Spinner } from "grommet"; // Spinner,
import styled from "styled-components";
import InfiniteScroll from "react-infinite-scroll-component";

import { useActionsContext } from "../../context";
import { isValidAddress } from "../../utils/user";
import { useUserContext } from "../../context";

import { HeaderList } from "./headerList";
import { PlainText } from "../../components/button";
import {
  LocationFilter,
  useIsUserPage,
  useTopLocations,
  useTopTags,
  useUrls,
} from "./hooks";
import { ReactionsProvider } from "../../context";
import UserAction from "../../components/action";
import { useLocation } from "react-router-dom";

const UserPageBox = styled(Box)`
  .filter-panel {
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
    // filterMode,
    setFilterMode,
    DefaultFilterMode,
    isLoading,
    lastVisible,
    loadActions,
  } = useActionsContext();

  const location = useLocation();
  const topicsQueryParam = location.search.substring(1);

  const indexedUrls = useMemo(
    () => urls.map((u, i) => ({ ...u, index: i })),
    [urls]
  );

  useEffect(() => {
    if (topicsQueryParam === 'clear') {
      setFilters([])
    }
  }, [topicsQueryParam])

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
  return (
    <UserPageBox margin={{ top: "28px" }}>
      <Box gap={"16px"} pad={"2px 16px"}>
        <HeaderList {...headerListProps} type={"url"} items={indexedUrls} />
        <HeaderList
          {...headerListProps}
          type={"hashtag"}
          items={indexedItems}
        />
      </Box>
      <Box
        margin={{ top: "32px", bottom: "8px" }}
        className="filter-panel"
        pad={"0 16px"}
      >
        <Box direction={"row"} gap="12px">
          <PlainText style={{ cursor: 'pointer' }} onClick={() => setFilterMode("all")}>all</PlainText>
          <PlainText style={{ cursor: 'pointer' }} onClick={() => setFilterMode("address")}>
            0/{key?.substring(0, 4)}
          </PlainText>
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
                <Box key={value}>
                  <LocationFilter
                    address={value}
                    onClick={onClick}
                    latestLocation={actions[0]?.address}
                  />
                </Box>
              ) : (
                <PlainText
                  key={value}
                  style={{ cursor: 'pointer' }}
                  color={isUserPage ? "blue1" : "yellow1"}
                  onClick={onClick}
                >
                  #{value}
                </PlainText>
              );
            })}
        </Box>
        {/* <Box direction={"row"} alignSelf="center" alignContent="around">
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
            <PlainText fontSize="min(1em, 4vw)">#one</PlainText>
          </PlainButton>
          <PlainButton
            isActive={filterMode === "hashtag"}
            onClick={() => {
              if (filters.find((item) => item.value === "ai")) {
                const newFilters = filters.filter(
                  (item) => item.value !== value
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
            <PlainText fontSize="min(1em, 4vw)">#ai</PlainText>
          </PlainButton>
          {/* <PlainButton style={{ padding: '2px' }}>
            <PlainText fontSize="min(1em, 4vw)">
              <StarOutlined />
            </PlainText>
          </PlainButton> */}
        {/* </Box> */}
      </Box>
      <Box pad={"0 16px"}>
        {!actions.length && isLoading && (
          <Box align={"center"}>
            <Spinner color={"spinner"} />
          </Box>
        )}
        {/* {actions.length === 0 && (
          <Box align={"center"}>
            <Text color="grey1">No actions found</Text>
          </Box>
        )} */}
        <ReactionsProvider>
          <InfiniteScroll
            dataLength={actions.length}
            next={() => {
              loadActions(lastVisible);
            }}
            hasMore={true}
            loader={""}
            // scrollThreshold="200px"
          >
            {actions.map((action, index) => {
              // const id = getUniqueId(action) // now using doc id.
              return (
                <UserAction
                  userId={key}
                  index={action.id} // index + action.timestamp}
                  key={index + action.timestamp}
                  action={action}
                  onTagClicked={onTagClicked}
                  onLocationClicked={onLocationClicked}
                />
              );
            })}
          </InfiniteScroll>
        </ReactionsProvider>
      </Box>
    </UserPageBox>
  );
};
