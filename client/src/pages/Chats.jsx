import React, { useState } from 'react'
import { Box } from '@chakra-ui/react';
import SideDrawer from '../components/SideDrawer';
import MyChats from '../components/MyChats';
import ChatBox from '../components/ChatBox';

const Chats = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <Box w='100%'>
      <SideDrawer setSelectedChat={setSelectedChat} />
      <Box
        display='flex'
        justifyContent='space-between'
        w='100%'
        h='91.5vh'
        p='10px'
      >
        <MyChats selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
        <ChatBox selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
      </Box>
    </Box>
  )
}

export default Chats;