import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice';
import { setupListeners } from '@reduxjs/toolkit/dist/query';
import authSlice from './authSlice';
import notificationSlice from './notificationSlice';

const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authSlice,
        notifications: notificationSlice
    },
    middleware: getDefaultMeddleware => getDefaultMeddleware().concat(apiSlice.middleware),
    devTools: true
})

setupListeners(store.dispatch);

export default store;