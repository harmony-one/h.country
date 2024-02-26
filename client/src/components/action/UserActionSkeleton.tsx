import { Skeleton } from "antd";
import { Box } from "grommet";
import React from "react";

const UserActionSkeleton: React.FC = () => {
  return (
    <Box border={{ side: "bottom", color: "border" }} pad={"4px 0"}>
      <Skeleton.Input active={true} size={'default'} block={true} />
    </Box>
  );
};

export default UserActionSkeleton;
