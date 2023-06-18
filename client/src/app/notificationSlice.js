import { createSlice } from "@reduxjs/toolkit";

const initialState = []

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action) => {
            state.push(action.payload);
        },
        removeNotification: (state, action) => {
            const index = state.findIndex(item => item._id !== action.payload);
            state.splice(index, 1);
        }
    }
})

export const { addNotification, removeNotification } = notificationSlice.actions;

export default notificationSlice.reducer;