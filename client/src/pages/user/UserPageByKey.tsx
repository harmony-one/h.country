import React from "react";

import { useParams } from "react-router-dom";
import { UserPage } from ".";
import { Text } from "grommet";

export const UserPageByKey = () => {
    const { key } = useParams();

    if (!key) {
        return <Text>Key not found</Text>
    }

    return <UserPage id={key} />
}
