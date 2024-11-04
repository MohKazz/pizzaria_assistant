'use client';

import { TextField, Button, Box, Stack, Typography, Avatar, CircularProgress, IconButton } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Analytics } from "@vercel/analytics/react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey! I'm Mario. What would you like to order today?",
      timestamp: '', // Leave this empty initially
    },
  ]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // State to track the current theme
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Set the timestamp on the client side after mounting
    setMessages((prevMessages) => 
      prevMessages.map((msg) => ({
        ...msg,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }))
    );
  }, []);

  const sendMessage = async () => {
    if (message.trim() === '') return;
    setLoading(true);
    setTyping(true);

    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const userMessage = {
      role: 'user',
      content: message,
      timestamp, // Include timestamp in the user message
    };

    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage,
      { role: 'assistant', content: '', timestamp: null },
    ]);

    setMessage('');

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([...messages, userMessage]),
    });

    const result = await response.json();

    setLoading(false);
    setTyping(false);

    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      return [
        ...prevMessages.slice(0, prevMessages.length - 1),
        {
          ...lastMessage,
          content: result.result || 'No response',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        },
      ];
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleThemeChange = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = {
    backgroundColor: '#000000',          // Background color for the main layout (black)
    color: '#FFFFFF',                    // Primary text color (white)

    chatBoxBg: '#1a1a1a',                // Slightly lighter black for the chat box background
    assistantBg: '#000000',              // Assistant message background (black)
    userBg: '#FFD055',                   // User message background (gold)

    // Scrollbar colors
    scrollThumb: '#FFD700',              // Gold color for the scrollbar thumb
    scrollTrack: '#333333',              // Dark track color to blend with the black background

    // Additional properties for consistency with the new style
    borderColor: '#4d4d4d',              // Dark gray border color for elements
    buttonBg: '#FFD700',                 // Gold background for buttons
    buttonText: '#000000',               // Black text color for buttons to contrast with gold

    // Shadows and highlights for a modern, subtle 3D effect
    shadow: 'rgba(255, 215, 0, 0.3)',    // Light gold shadow for a subtle effect
    highlight: '#FFD700',                // Gold accent color for highlights
};



  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor={theme.backgroundColor}
      color={theme.color}
      p={2}
    >
      {/* <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" p={2}>
        <Typography variant="h3" sx={{ color: theme.color, margin: '0 auto' }}>
          Delicious Bites
        </Typography>
        <IconButton onClick={handleThemeChange} color="inherit" sx={{ fontSize: '2rem', marginRight: '16px' }}>
          {isDarkMode ? <Brightness7Icon fontSize="inherit" /> : <Brightness4Icon fontSize="inherit" />}
        </IconButton>
      </Box> */}
      <Stack
        direction="column"
        width="100%"
        maxWidth="800px"
        height="80%"
        borderRadius={4}
        p={3}
        spacing={3}
        bgcolor={theme.chatBoxBg}
        boxShadow="0px 4px 15px rgba(0, 0, 0, 0.1)"
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          p={2}
          sx={{
            scrollbarWidth: 'thin',
            scrollbarColor: `${theme.scrollThumb} ${theme.scrollTrack}`,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: theme.scrollTrack,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.scrollThumb,
              borderRadius: '4px',
            },
          }}
        >
          {messages.map((messageObj, index) => (
            <Box
              key={index}
              display="flex"
              flexDirection={messageObj.role === 'assistant' ? 'row' : 'row-reverse'}
              alignItems="flex-start"
              mb={1}
            >
              <Box display="flex" flexDirection="column" alignItems="center" ml={messageObj.role === 'assistant' ? 0 : 2} mr={messageObj.role === 'assistant' ? 2 : 0}>
                <Avatar sx={{ bgcolor: messageObj.role === 'assistant' ? theme.assistantBg : theme.userBg, mb: 1 }}>
                  <img src={messageObj.role === 'assistant' ? "/pic.png" : "/customer.png"} alt={messageObj.role === 'assistant' ? "Assistant" : "You"} style={{ width: '100%', height: '100%' }} />
                </Avatar>
                <Typography variant="subtitle2" sx={{ color: theme.color }}>
                  {messageObj.role === 'assistant' ? "Mario" : "You"}
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: messageObj.role === 'assistant' ? theme.assistantBg : theme.userBg,
                  color: theme.color,
                  borderRadius: "18px",
                  p: 2,
                  maxWidth: "70%",
                  boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
                  animation: "fadeIn 0.3s ease-in-out"
                }}
              >
                <Typography variant="body1">
                  {messageObj.content}
                </Typography>
                {messageObj.timestamp && (
                  <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: messageObj.role === 'assistant' ? 'left' : 'right' }}>
                    {messageObj.timestamp}
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
          {/* {typing && (
            <Box display="flex" alignItems="center" mt={2}>
              <Avatar sx={{ bgcolor: theme.assistantBg, mr: 1 }}>
                <img src="/pic.png" alt="Assistant" style={{ width: '100%', height: '100%' }} />
              </Avatar>
              <Typography variant="subtitle2" sx={{ color: theme.color, mr: 2 }}>
                Mario
              </Typography>
              <Typography variant="body2" sx={{ color: theme.color }}>
                Mario is typing...
              </Typography>
            </Box>
          )} */}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Type your message and press Enter..."
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            variant="outlined"
            sx={{
              input: { color: theme.color },
              bgcolor: theme.scrollTrack,
              borderRadius: '4px',
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            disabled={loading}
            sx={{
              minWidth: '100px',
              bgcolor: theme.scrollThumb,
              '&:hover': {
                bgcolor: isDarkMode ? '#2c387e' : '#82B5B8',
              },
            }}
          >
            {loading ? <CircularProgress size={24} /> : "Send"}
          </Button>
        </Stack>
      </Stack>
      <Analytics />
    </Box>
  );
}
