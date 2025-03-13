// pages/register.js
import React, { useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import NextLink from "next/link";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  VStack,
  Text,
  Alert,
  AlertIcon,
  AlertDescription,
  useColorModeValue,
  InputRightElement,
  InputGroup,
  IconButton,
  Link,
  Divider,
} from "@chakra-ui/react";
import {  LockIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { User as UserIcon, Mail as EmailIcon } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Background and card styling
  const bgGradient = useColorModeValue(
    "radial-gradient(circle at 50% 50%, rgba(188, 113, 221, 0.1) 0%, rgba(255, 255, 255, 0) 100%)",
    "radial-gradient(circle at 50% 50%, rgba(188, 113, 221, 0.2) 0%, rgba(0, 0, 0, 0.5) 100%)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const cardShadow = useColorModeValue("lg", "dark-lg");

  // Redirect if already logged in
  if (status !== "loading" && session) {
    router.push("/explore");
    return null;
  }

  const validatePassword = () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Redirect to login page on success
      router.push("/login?registered=true");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      p={2}
      background={bgGradient}
    >
      <Container maxW="md">
        <Box
          bg={cardBg}
          boxShadow={cardShadow}
          borderRadius="xl"
          p={8}
          width="full"
        >
          <Text 
            fontSize="2xl" 
            fontWeight="bold" 
            textAlign="center" 
            mb={6}
          >
            Create an Account
          </Text>

          {error && (
            <Alert 
              status="error" 
              variant="left-accent"
              mb={4}
              borderRadius="md"
            >
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Full Name</FormLabel>
                <InputGroup>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    pr={10}
                  />
                  <InputRightElement pointerEvents="none">
                    <UserIcon color="gray.500" />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <InputGroup>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    pr={10}
                  />
                  <InputRightElement pointerEvents="none">
                    <EmailIcon color="gray.500" />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    pr={10}
                  />
                  <InputRightElement>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      h="full"
                      w="full"
                    />
                  </InputRightElement>
                </InputGroup>
                <FormHelperText>
                  Password must be at least 8 characters long
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    pr={10}
                  />
                  <InputRightElement>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      h="full"
                      w="full"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Button 
                type="submit" 
                colorScheme="purple" 
                width="full"
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </VStack>
          </form>

          <Text mt={4} textAlign="center" fontSize="sm">
            Already have an account?{" "}
            <Link 
              as={NextLink} 
              href="/login" 
              color="purple.500" 
              fontWeight="bold"
              _hover={{ textDecoration: "underline" }}
            >
              Sign In
            </Link>
          </Text>
        </Box>
      </Container>
    </Box>
  );
}