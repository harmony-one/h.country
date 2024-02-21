import React, { useEffect } from "react";

import { useParams } from "react-router-dom";
import { UserPage } from ".";
import { Text } from "grommet";
import { useUserContext } from "../../context/UserContext";

export const UserPageByKey = () => {
    const { setPageOwnerAddress } = useUserContext();
    const { key } = useParams();

    useEffect(() => {
        if (key) {
            setPageOwnerAddress(key);
        }
    }, [key, setPageOwnerAddress])

    if (!key) {
        return <Text>Key not found</Text>
    }

    return <UserPage id={key} />
}
