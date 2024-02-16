import React from "react";
import { Box } from "grommet";

export const TagPage = (props: { id: string }) => {
    const { id } = props;

    return <Box>
        Tag id: {id}
    </Box>
}
