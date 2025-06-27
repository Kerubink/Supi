import React, { useState, useRef, useEffect } from 'react';
import Fab from '@mui/material/Fab';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';

function FloatingChatButton({ children }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const popoverRef = useRef(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'chat-popover' : undefined;

  const handleOutsideClick = (event) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target) && anchorEl) {
      handleClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [anchorEl]);

  return (
    <>
      <Fab
        color="primary"
        aria-label="chat"
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
        }}
      >
        <ChatBubbleIcon />
      </Fab>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        ref={popoverRef}
      >
        <Box sx={{ p: 3, maxWidth: 400, maxHeight: 500, overflow: 'auto' }}>
          {children} {/* Aqui você renderizará seu componente de Chatbot */}
        </Box>
      </Popover>
    </>
  );
}

export default FloatingChatButton;