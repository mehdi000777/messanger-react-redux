import React from 'react'
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../app/authSlice';

const useGetSender = () => {
    const curretnUser = useSelector(selectCurrentUser);

    const sender = (chatUsers) => {
        return chatUsers?.filter(item => item._id !== curretnUser._id)[0];
    }

    return { sender };
}

export default useGetSender