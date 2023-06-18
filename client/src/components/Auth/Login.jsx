import {
    Button,
    FormControl,
    FormLabel,
    Input,
    InputRightElement,
    VStack,
    InputGroup,
    useToast
} from '@chakra-ui/react';
import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../../app/authApiSlice';
import { setCredentials } from '../../app/authSlice';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const toast = useToast();

    const [login] = useLoginMutation();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();

        setLoading(true);
        try {
            const res = await login({ email, password }).unwrap();
            dispatch(setCredentials(res));
            toast({
                title: res?.message,
                status: 'success',
                duration: '5000',
                isClosable: true,
                position: 'bottom'
            })
            setLoading(false);
            navigate('/chats');

        } catch (error) {
            toast({
                title: 'Login Error',
                description: error?.data?.message,
                status: 'error',
                duration: '5000',
                isClosable: true,
                position: 'bottom'
            })
            setLoading(false)
        }
    }

    return (
        <VStack
            spacing='5px'
            color='black'
        >
            <FormControl id='email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                    type='email'
                    value={email}
                    placeholder='Enter Your Email'
                    onChange={(e) => setEmail(e.target.value)}
                />
            </FormControl>
            <FormControl id='password' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        placeholder='Enter Your Password'
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputRightElement width='4.5rem'>
                        <Button h="1.75rem" size='sm' onClick={() => setShowPassword(prev => !prev)}>
                            {showPassword ? 'Hide' : 'Show'}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <Button
                colorScheme='blue'
                width='100%'
                style={{ marginTop: 15 }}
                onClick={submitHandler}
                isLoading={loading}
            >
                Login
            </Button>
            <Button
                variant='solid'
                colorScheme='red'
                width='100%'
                onClick={() => {
                    setEmail('guest@example.com');
                    setPassword('123456')
                }}
            >
                Get Guest User Credentials
            </Button>
        </VStack>
    )
}

export default Login;