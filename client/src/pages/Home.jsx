import React from 'react'
import { Box, Container, Tab, TabList, Tabs, Text, TabPanels, TabPanel } from '@chakra-ui/react'
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';

const Home = () => {
  return (
    <Container maxWidth='xl' centerContent>
      <Box
        display='flex'
        justifyContent='center'
        p={3}
        bg='white'
        w='100%'
        m='40px 0 15px 0'
        borderRadius='lg'
        borderWidth='1px'
      >
        <Text
          color='black'
          fontSize='4xl'
        >
          Messanger
        </Text>
      </Box>
      <Box
        bg='white'
        w='100%'
        p={4}
        mb={10}
        borderRadius='lg'
        borderWidth='1px'
      >
        <Tabs variant='soft-rounded'>
          <TabList>
            <Tab width='50%'>Login</Tab>
            <Tab width='50%'>Sing Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Register />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container >
  )
}

export default Home;