import { apiSlice } from "./api/apiSlice";
import { logOut, setCredentials } from "./authSlice";

const authApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        login: builder.mutation({
            query: initialUserData => ({
                url: '/api/auth/login',
                method: 'POST',
                body: { ...initialUserData }
            })
        }),
        register: builder.mutation({
            query: initialUserData => ({
                url: '/api/auth/register',
                method: 'POST',
                body: { ...initialUserData }
            })
        }),
        refresh: builder.mutation({
            query: () => ({
                url: '/api/auth/refresh',
                method: 'GET',
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials(data))
                } catch (error) {
                    console.log(error)
                }
            }
        }),
        sendLogOut: builder.mutation({
            query: () => ({
                url: '/api/auth/logout',
                method: 'POST'
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;

                    dispatch(logOut());
                    setTimeout(() => {
                        dispatch(apiSlice.util.resetApiState())
                    }, 1000);
                } catch (error) {
                    console.log(error)
                }
            }
        })
    })
})


export const {
    useLoginMutation,
    useRegisterMutation,
    useRefreshMutation,
    useSendLogOutMutation
} = authApiSlice;