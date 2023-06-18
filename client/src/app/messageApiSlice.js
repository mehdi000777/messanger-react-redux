import { apiSlice } from "./api/apiSlice";

export const messageApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getMessages: builder.query({
            query: chatId => `/api/messages/${chatId}`,
            providesTags: ['Messages']
        }),
        sendMessage: builder.mutation({
            query: ({ chatId, content, originalArgs }) => ({
                url: '/api/messages',
                method: 'POST',
                body: { chatId, content }
            }),
            async onQueryStarted({ originalArgs }, { dispatch, queryFulfilled }) {
                try {
                    const res = await queryFulfilled;
                    dispatch(
                        messageApiSlice.util.updateQueryData('getMessages', originalArgs, draft => {
                            draft.push(res?.data);
                        })
                    );
                } catch (error) { }
            }
        })
    })
})

export const {
    useSendMessageMutation,
    useLazyGetMessagesQuery,
} = messageApiSlice;