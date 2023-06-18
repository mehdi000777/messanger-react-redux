import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    token: null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            localStorage.setItem('firstLogin', true);
        },
        logOut: (state, action) => {
            state.token = null;
            state.user = null;
            localStorage.removeItem('firstLogin');
        }
    }
})

export const selectCurrentToken = (state) => state.auth.token;
export const selectCurrentUser = (state) => state.auth.user;

export const { setCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;