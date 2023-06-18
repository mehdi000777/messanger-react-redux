import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logOut, selectCurrentToken, setCredentials } from '../../app/authSlice';
import { useRefreshMutation } from '../../app/authApiSlice';
import { useToast } from '@chakra-ui/react';

const PersistLogin = () => {
    const token = useSelector(selectCurrentToken);
    const effectRan = useRef(false);

    const [trueSuccess, setTrueSuccess] = useState(false);

    const toast = useToast();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const firstLogin = localStorage.getItem('firstLogin');

    const [
        refresh,
        {
            isLoading,
            isSuccess,
            isUninitialized,
            isError
        }
    ] = useRefreshMutation();

    useEffect(() => {
        if (effectRan.current === true || !import.meta.env.DEV) {
            const verifyRefreshToken = async () => {
                try {
                    const res = await refresh().unwrap();
                    dispatch(setCredentials(res));
                    setTrueSuccess(true);
                    if (pathname === '/') navigate('/chats');
                } catch (error) {
                    toast({
                        title: error?.data?.message,
                        status: 'error',
                        duration: 5000,
                        isClosable: true
                    })

                    dispatch(logOut());
                    navigate('/');
                }
            }

            if (!token && firstLogin) verifyRefreshToken();
        }

        return () => effectRan.current = true;

        // eslint-disable-next-line
    }, [])

    let content;
    if (!firstLogin) {
        content = <Outlet />
    } else if (isError) {
        content = <Outlet />
    } else if (isLoading) {
        content = <div>Loading...</div>
    } else if (isSuccess && trueSuccess) {
        content = <Outlet />
    } else if (token && isUninitialized) {
        content = <Outlet />
    }

    return content;
}

export default PersistLogin;