import { apiSlice } from "./api/apiSlice";


const chatApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getUserChats: builder.query({
            query: () => `/api/chats`,
            providesTags: ['Chats']
        }),
        accessChat: builder.mutation({
            query: (userId) => ({
                url: `/api/chats/${userId}`,
                method: 'POST',
            }),
            invalidatesTags: ['Chats']
        }),
        creatGroup: builder.mutation({
            query: initialGroup => ({
                url: '/api/chats/group',
                method: 'POST',
                body: { ...initialGroup }
            }),
            invalidatesTags: ['Chats']
        }),
        renameGroup: builder.mutation({
            query: ({ name, chatId }) => ({
                url: '/api/chats/rename',
                method: 'PUT',
                body: { name, chatId }
            }),
            async onQueryStarted({ name, chatId }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    chatApiSlice.util.updateQueryData('getUserChats', 'getUserChats', draft => {
                        const chat = draft.find(chat => chat._id === chatId);
                        if (chat) chat.name = name;
                    })
                )
                try {
                    await queryFulfilled;
                } catch (error) {
                    patchResult.undo();
                }
            }
        }),
        addUserToGroup: builder.mutation({
            query: ({ user, chatId }) => ({
                url: '/api/chats/groupAdd',
                method: 'PUT',
                body: { userId: user._id, chatId }
            }),
            async onQueryStarted({ user, chatId }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    chatApiSlice.util.updateQueryData('getUserChats', 'getUserChats', draft => {
                        const chat = draft.find(chat => chat._id === chatId);
                        if (chat) chat.users = [...chat.users, user];
                    })
                )
                try {
                    await queryFulfilled;
                } catch (error) {
                    patchResult.undo();
                }
            }
        }),
        removeUserGroup: builder.mutation({
            query: ({ user, chatId }) => ({
                url: '/api/chats/groupRemove',
                method: 'PUT',
                body: { userId: user._id, chatId }
            }),
            async onQueryStarted({ user, chatId }, { dispatch, queryFulfilled, getState }) {
                const patchResult = dispatch(
                    chatApiSlice.util.updateQueryData('getUserChats', 'getUserChats', draft => {
                        if (user._id === getState().auth.user._id) {
                            const index = draft.findIndex(item => item._id === chatId);
                            draft.splice(index, 1);
                        } else {
                            const chat = draft.find(chat => chat._id === chatId);
                            chat.users = chat.users.filter(item => item._id !== user._id)
                        }
                    })
                )
                try {
                    await queryFulfilled;
                    // if (user._id === getState().auth.user._id) {
                    //     dispatch(
                    //         chatApiSlice.util.invalidateTags(['Chats'])
                    //     )
                    // }
                } catch (error) {
                    patchResult.undo();
                }
            }
        }),
    })
})

export const {
    useAccessChatMutation,
    useGetUserChatsQuery,
    useCreatGroupMutation,
    useRenameGroupMutation,
    useAddUserToGroupMutation,
    useRemoveUserGroupMutation
} = chatApiSlice;