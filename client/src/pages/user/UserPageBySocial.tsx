import React, { ReactNode, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { UserPage } from ".";
import { Text } from "grommet";
import { getUserBySocial } from "../../api/firebase";

export const UserPageBySocial = () => {
    const { socialType = '', username } = useParams();
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadUser = useCallback(async () => {
        try {
            if (!socialType || !username) {
                throw new Error('Wrong params');
            }

            const res = await getUserBySocial({
                key: `${socialType}.username`,
                value: username
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
    }, [socialType, username])

    useEffect(() => {
        loadUser();
    }, [socialType, username])

    if (loading) {
        return <Text>Loading...</Text>
    }

    if (error) {
        return <Text>{error}</Text>
    }

    return <UserPage id={userId} />
}