import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { UserPage } from ".";
import { Text } from "grommet";
import { getAddress } from "../../utils";

export const UserPageByOne = () => {
    const { addressOne } = useParams();
    const [addressEth, setAddressEth] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        try {
            if (addressOne) {
                setAddressEth(getAddress(addressOne).basicHex.slice(2));
            } else {
                throw new Error('ONE Address not found')
            }
        } catch (e: any) {
            setError((e && e.message) || 'Unknown error')
        }

        setLoading(false);
    }, [addressOne])

    if (loading) {
        return <Text>Loading...</Text>
    }

    if (error) {
        return <Text>{error}</Text>
    }

    return <UserPage id={addressEth} />
}
