import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { TagPage } from ".";
import { Text } from "grommet";

export const TagPageByName = () => {
    const { tagName } = useParams();
    const [id, setId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadUser = useCallback(async () => {
        try {
            if (!tagName) {
                throw new Error('Wrong params');
            }

            setId(tagName)

            // if (res[0]) {
            //     setId(res[0].id)
            // } else {
            //     throw new Error('User not found')
            // }
        } catch (e: any) {
            setError((e && e.message) || 'Unknown error')
        }

        setLoading(false);
    }, [tagName])

    useEffect(() => {
        loadUser();
    }, [tagName, loadUser])


    if (loading) {
        return <Text>Loading...</Text>
    }

    if (error) {
        return <Text>{error}</Text>
    }

    return <TagPage id={id} />
}
