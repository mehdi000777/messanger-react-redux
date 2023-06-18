import {
    Button,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    VStack,
    useToast
} from '@chakra-ui/react';
import React, { useState } from 'react'
import axios from 'axios';
import { useRegisterMutation } from '../../app/authApiSlice';
import { setCredentials } from '../../app/authSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [image, setImage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [register] = useRegisterMutation();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const toast = useToast();

    const postDetails = async (pic) => {
        setLoading(true);
        if (pic === undefined) {
            setLoading(false);
            toast({
                title: 'Image Error',
                description: 'Please enter your image',
                status: 'error',
                duration: '5000',
                isClosable: true,
                position: 'bottom'
            })
            return;
        }
        if (pic.type === 'image/png' || pic.type === 'image/jpeg') {
            const data = new FormData();
            data.append("file", pic);
            data.append("upload_preset", "wcsafcte");
            data.append("cloud_name", 'mehdi000777');
            try {
                const { data: resData } = await axios.post(import.meta.env.VITE_CLOUDINAY_API_URL, data);
                console.log(resData);
                setImage(resData.secure_url);
                setLoading(false);
            } catch (error) {
                toast({
                    title: error.message,
                    description: 'Please enter your image',
                    status: 'error',
                    duration: '5000',
                    isClosable: true,
                    position: 'bottom'
                })
                setLoading(false)
            }
        } else {
            toast({
                title: 'Image Error',
                description: 'Please enter your image',
                status: 'error',
                duration: '5000',
                isClosable: true,
                position: 'bottom'
            })
            setLoading(false);
        }
    }

    const submitHandler = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) return toast({
            title: 'Register Error',
            description: 'Confirm password wrong',
            status: 'error',
            duration: '5000',
            isClosable: true,
            position: 'bottom'
        })

        setLoading(true);
        try {
            const res = await register({ name, email, password, image }).unwrap();
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
                title: 'Register Error',
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
            <FormControl id='first-name' isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                    placeholder='Enter Your Name'
                    onChange={(e) => setName(e.target.value)}
                />
            </FormControl>
            <FormControl id='email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                    type='email'
                    placeholder='Enter Your Email'
                    onChange={(e) => setEmail(e.target.value)}
                />
            </FormControl>
            <FormControl id='password' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input
                        type={showPassword ? 'text' : 'password'}
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
            <FormControl id='confirm-password' isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Enter Your Confirm Password'
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <InputRightElement width='4.5rem'>
                        <Button h="1.75rem" size='sm' onClick={() => setShowPassword(prev => !prev)}>
                            {showPassword ? 'Hide' : 'Show'}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <FormControl id='first-name' isRequired>
                <FormLabel>Upload Your Picture</FormLabel>
                <Input
                    type='file'
                    p={1.5}
                    accept='image/*'
                    onChange={(e) => postDetails(e.target.files[0])}
                />
            </FormControl>

            <Button
                colorScheme='blue'
                width='100%'
                style={{ marginTop: 15 }}
                onClick={submitHandler}
                isLoading={loading}
            >
                Sign Up
            </Button>
        </VStack>
    )
}

export default Register;