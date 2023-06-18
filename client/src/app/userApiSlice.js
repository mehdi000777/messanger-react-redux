import { apiSlice } from "./api/apiSlice";


const userApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getSearchUsers: builder.query({
            query: (search) => ({
                url: `/api/users?search=${search}`,
                method: 'GET'
            }),
        })
    })
})

export const { useLazyGetSearchUsersQuery } = userApiSlice;