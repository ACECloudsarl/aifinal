// pages/login.js
import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import NextLink from "next/link";
import {
  Box,
  Button,
  Container,
  FormControl,
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
import { EmailIcon, LockIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

export default function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Background and card styling
  const bgGradient = useColorModeValue(
    "radial-gradient(circle at 50% 50%, rgba(188, 113, 221, 0.1) 0%, rgba(255, 255, 255, 0) 100%)",
    "radial-gradient(circle at 50% 50%, rgba(188, 113, 221, 0.2) 0%, rgba(0, 0, 0, 0.5) 100%)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const cardShadow = useColorModeValue("lg", "dark-lg");

  // Get error from URL if present
  useEffect(() => {
    if (router.query.error) {
      setError("Authentication failed. Please check your credentials.");
    }
  }, [router.query]);

  // Redirect if already logged in
  if (status !== "loading" && session) {
    router.push("/explore");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: "/explore",
      });

      if (result?.error) {
        setError(result.error || "Invalid email or password");
      } else {
        router.push(result?.url || "/explore");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/explore" });
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
            Welcome Back
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
              </FormControl>

              <Button 
                type="submit" 
                colorScheme="purple" 
                width="full"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </VStack>
          </form>

          <Divider my={6} />

          <Button
            variant="outline"
            width="full"
            onClick={handleGoogleSignIn}
          >
            Continue with Google
          </Button>

          <Text mt={4} textAlign="center" fontSize="sm">
            Don't have an account?{" "}
            <Link 
              as={NextLink} 
              href="/register" 
              color="purple.500" 
              fontWeight="bold"
              _hover={{ textDecoration: "underline" }}
            >
              Sign Up
            </Link>
          </Text>
        </Box>
      </Container>
    </Box>
  );
}