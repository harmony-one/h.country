import { useEffect, useState } from "react";
import { useUserContext } from "../../../context";
import { isSameAddress } from "../../../utils/user";


export const useIsUserPage = () => {
    const { pageOwnerAddress, wallet } = useUserContext();
    const [isUserPage, setIsUserPage] = useState(false);

    useEffect(() => {
        if (wallet?.address && pageOwnerAddress) {
            setIsUserPage(
                isSameAddress(wallet.address.substring(2), pageOwnerAddress)
            );
        }
    }, [wallet?.address, pageOwnerAddress]);

    return isUserPage;
}