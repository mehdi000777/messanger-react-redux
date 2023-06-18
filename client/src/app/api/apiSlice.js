import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logOut } from '../authSlice';

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token;

        if (token) headers.set('authorization', `Bearer ${token}`);

        return headers;
    }
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error?.status === 403) {
        console.log('sending refresh token');

        const refreshResult = await baseQuery('/api/auth/refresh', api, extraOptions);

        if (refreshResult?.data) {
            api.dispatch(setCredentials({ ...refreshResult }));

            result = await baseQuery(args, api, extraOptions);
        } else {
            if (refreshResult.error.status === 403) {
                refreshResult.error.data.message = 'Your login has expired.';
                api.dispatch(logOut());
            }
            return refreshResult;
        }
    }

    return result;
}

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Chats', 'Messages'],
    endpoints: builder => ({})
})