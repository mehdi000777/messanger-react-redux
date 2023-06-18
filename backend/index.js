import express from 'express';
import cors from 'cors';
import corsOptions from './configs/corsOptions.js';
import dotenv from 'dotenv';
import connectDb from './configs/connectDb.js';
import mongoose from 'mongoose';
import authRoute from './routes/authRoute.js';
import cookieParser from 'cookie-parser';
import userRoute from './routes/userRoute.js';
import chatRoute from './routes/chatRoute.js';
import messageRoute from './routes/messageRoute.js';
import { Server } from 'socket.io';

dotenv.config();
const app = express();

connectDb();

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/api/auth', authRoute)
app.use('/api/users', userRoute)
app.use('/api/chats', chatRoute)
app.use('/api/messages', messageRoute)

app.all('*', (req, res) => {
    res.status(404).json({ message: '404 Not Found' })
})

const PORT = process.env.PORT || 5000;

mongoose.connection.once('open', () => {
    console.log('connected to MongoDB')
    const server = app.listen(PORT, () => {
        console.log(`app run in http://localhost:${PORT}`)
    })

    const io = new Server(server, {
        pingTimeout: 60000,
        cors: {
            origin: process.env.ALLOWED_URL,
        }
    })

    io.on('connection', socket => {
        console.log('connected to socket.io')

        socket.on('setup', (userData) => {
            socket.join(userData._id);
            console.log(userData._id)
            socket.emit('connected');
        })

        socket.on('join chat', room => {
            socket.join(room);
            console.log('User Joined Room:' + room)
        })

        socket.on('typing', users => {
            users.forEach(user => {
                socket.in(user).emit('typing');
            })
        });

        socket.on('stop typing', users => {
            users.forEach(user => {
                socket.in(user).emit('stop typing');
            })
        });

        socket.on('new message', (newMessageRecived) => {
            const chat = newMessageRecived.chat;

            if (!chat.users) return console.log('chat.users not defined');

            chat.users.forEach(user => {
                if (user._id === newMessageRecived.sender._id) return;

                socket.in(user._id).emit('message recieved', newMessageRecived);
            })
        })

        socket.off('setup', (userData) => {
            console.log('USER DISCONNECTED');
            socket.leave(userData._id)
        })
    })
})

mongoose.connection.on('error', (err) => {
    console.log(err)
})
