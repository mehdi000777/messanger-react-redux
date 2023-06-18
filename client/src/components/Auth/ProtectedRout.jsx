import React from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentToken } from '../../app/authSlice'
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRout = () => {
    const curretnToken = useSelector(selectCurrentToken);

    return (
        <>
            {
                curretnToken ? <Outlet /> : <Navigate to='/' replace />
            }
        </>
    )
}

export default ProtectedRout