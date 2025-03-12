// pages/login.js (updated)
import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Typography,
  Alert,
} from "@mui/joy";
import { Mail, Key, AlertCircle } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
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

      if (result.error) {
        setError(result.error || "Invalid email or password");
      } else {
        router.push(result.url || "/explore");
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
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        p: 2,
        backgroundImage:
          "radial-gradient(circle at 50% 50%, rgba(188, 113, 221, 0.1) 0%, rgba(255, 255, 255, 0) 100%)",
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: "100%",
          boxShadow: "lg",
        }}
      >
        <CardContent>
          <Typography level="h4" textAlign="center" sx={{ mb: 3 }}>
            Welcome Back
          </Typography>

          {error && (
            <Alert
              color="danger"
              variant="soft"
              startDecorator={<AlertCircle />}
              sx={{ mb: 3 }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  startDecorator={<Mail size={16} />}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input
                  startDecorator={<Key size={16} />}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </FormControl>

              <Button type="submit" loading={isLoading}>
                Sign In
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3 }}>or</Divider>

          <Button
            variant="outlined"
            color="neutral"
            fullWidth
            onClick={handleGoogleSignIn}
          >
            Continue with Google
          </Button>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography level="body-sm">
              Don't have an account?{" "}
              <Link href="/register" style={{ textDecoration: "none" }}>
                <Typography
                  level="body-sm"
                  sx={{ color: "primary.500", fontWeight: "bold" }}
                >
                  Sign Up
                </Typography>
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}