import React, { ReactNode, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { UserPage } from ".";
import { Text } from "grommet";
import { getUserBySocial } from "../../api/firebase";

const SOCIAL_PREFIX: Record<string, string> = {
    g: "https://github.com",
    x: "https://twitter.com",
    ig: "https://www.instagram.com"
}

export const UserPageBySocial = () => {
    const { socialType = '', nickname } = useParams();
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadUser = useCallback(async () => {
        try {
            const socialPrefix = SOCIAL_PREFIX[socialType];

            if (!socialType || !nickname || !socialPrefix) {
                throw new Error('Wrong params');
            }

            const res = await getUserBySocial({
                key: socialType,
                value: `${socialPrefix}/${nickname}`
            })

            if (res[0]) {
                setUserId(res[0].id)
            } else {
                throw new Error('User not found')
            }
        } catch (e: any) {
            setError((e && e.message) || 'Unknown error')
        }

        setLoading(false);
    }, [socialType, nickname])

    useEffect(() => {
        loadUser();
    }, [socialType, nickname])

    if (loading) {
        return <Text>Loading...</Text>
    }

    if (error) {
        return <Text>{error}</Text>
    }

    return <UserPage id={userId} />
}