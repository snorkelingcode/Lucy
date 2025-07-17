import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Send, Play, MessageCircle, Bot, User } from 'lucide-react';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #1a1a2e 50%, #16213e 75%, #0f3460 100%);
`;

const Header = styled.header`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
  font-size: 0.9rem;
`;

const ServiceStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  opacity: 0.8;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$connected ? '#4ade80' : '#f87171'};
  animation: ${props => props.$connected ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem;
  gap: 2rem;
  align-items: flex-start;
`;

const GameViewContainer = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  min-height: 600px;
`;

const GameViewHeader = styled.div`
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GameViewTitle = styled.h3`
  color: white;
  font-size: 1.1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const GameViewContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 520px;
  border-radius: 0;
`;

const GameVideoWrapper = styled.div`
  width: 100%;
  max-width: 800px;
  height: 100%;
  background: #000;
  margin: 0 auto;
  border-radius: 0;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CroppedVideoWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TOP_CROP = 30;    // pixels to crop from the top
const BOTTOM_CROP = 0;  // pixels to crop from the bottom

const CroppedGameVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  margin-top: -${TOP_CROP}px;
  margin-bottom: -${BOTTOM_CROP}px;
`;

const CaptureControls = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const CaptureButton = styled.button`
  background: ${props => props.$isCapturing ? '#ef4444' : '#3b82f6'};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$isCapturing ? '#dc2626' : '#2563eb'};
  }
`;

const SourceSelect = styled.select`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.9rem;
  
  option {
    background: #1a1a2e;
    color: white;
  }
`;

const GamePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
  animation: ${props => props.$isRunning ? 'fadeIn 0.5s ease-in' : 'none'};
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const GameStatus = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: slideIn 0.5s ease-out;
  z-index: 10;
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const ChatSection = styled.div`
  width: 380px;
  display: flex;
  flex-direction: column;
  height: 600px;
  flex-shrink: 0;
`;

const ChatContainer = styled.div`
  height: 100%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const ChatHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatTitle = styled.h2`
  color: white;
  font-size: 1.25rem;
  font-weight: 500;
`;

const ConnectionButton = styled.button`
  background: ${props => props.$connected ? '#10b981' : '#3b82f6'};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.$connected ? '#059669' : '#2563eb'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Message = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  margin-bottom: 1rem;
  animation: slideIn 0.3s ease-out;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const MessageAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$isUser ? '#3b82f6' : '#10b981'};
  color: white;
  font-weight: 600;
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  background: ${props => props.$isUser ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.08)'};
  border: 1px solid ${props => props.$isUser ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.15)'};
  border-radius: 12px;
  padding: 1rem;
  color: white;
  max-width: 85%;
  word-wrap: break-word;
  line-height: 1.5;
`;

const InputContainer = styled.div`
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  background: rgba(255, 255, 255, 0.02);
`;

const InputWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const ChatInput = styled.textarea`
  width: 100%;
  min-height: 44px;
  max-height: 120px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  color: white;
  font-size: 0.95rem;
  resize: none;
  outline: none;
  transition: all 0.2s;
  line-height: 1.4;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background: rgba(255, 255, 255, 0.12);
  }
`;

const SendButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  
  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 0.25rem;
  
  div {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.8);
    animation: bounce 1.4s infinite ease-in-out both;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
  
  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
`;

const ChatScrollBox = styled.div`
  flex: 1;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
`;

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. I'll be appearing as a metahuman character. Ask me anything and watch me come to life!",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUnrealConnected, setIsUnrealConnected] = useState(false);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isNeuroSyncConnected, setIsNeuroSyncConnected] = useState(false);
  const [isElevenLabsAvailable, setIsElevenLabsAvailable] = useState(true);
  const [isChatGPTAvailable, setIsChatGPTAvailable] = useState(true);
  const [captureSources, setCaptureSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [gameStream, setGameStream] = useState(null);
  const [tcpConnected, setTcpConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const videoRef = useRef(null);

  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check NeuroSync connection on startup
    checkNeuroSyncConnection();
    
    // Check API configuration status
    checkApiConfiguration();
    
    // Listen for game auto-start event
    if (window.electronAPI) {
      window.electronAPI.onGameAutoStarted(() => {
        setIsUnrealConnected(true);
        setIsGameRunning(true);
        addMessage("🎮 Game auto-started! Select the game window to start streaming.", false);
        checkTcpConnection(); // Check TCP connection after auto-start
        
        // Refresh capture sources after a delay to allow game window to appear
        setTimeout(() => {
          refreshCaptureSources();
        }, 3000);
      });
      
      // Cleanup listeners on unmount
      return () => {
        window.electronAPI.removeAllListeners('game-auto-started');
      };
    }
  }, []);

  useEffect(() => {
    if (videoRef.current && gameStream) {
      videoRef.current.srcObject = gameStream;
      videoRef.current.play();
    }
  }, [gameStream]);

  const checkNeuroSyncConnection = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/audio_to_blendshapes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: new ArrayBuffer(0)
      });
      setIsNeuroSyncConnected(response.ok);
    } catch (error) {
      setIsNeuroSyncConnected(false);
    }
  };

  const checkApiConfiguration = async () => {
    try {
      if (window.electronAPI) {
        const apiStatus = await window.electronAPI.getApiStatus();
        setIsChatGPTAvailable(apiStatus.openai);
        setIsElevenLabsAvailable(apiStatus.elevenlabs);
        
        if (apiStatus.offline) {
          addMessage("⚠️ Running in offline mode - no API keys configured. Please run 'npm run setup' to configure your API keys.", false);
        } else if (apiStatus.chatOnly) {
          addMessage("ℹ️ Running in chat-only mode - ElevenLabs not configured. Audio generation will be disabled.", false);
        }
      }
    } catch (error) {
      console.error('Error checking API configuration:', error);
    }
  };

  const handleStartUnrealEngine = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.startUnrealEngine();
        if (result.success) {
          setIsUnrealConnected(true);
          setIsGameRunning(true);
          addMessage("Unreal Engine started successfully! Game window opened.", false);
          checkTcpConnection(); // Check TCP connection after game starts
        } else {
          addMessage(`Failed to start Unreal Engine: ${result.message}`, false);
        }
      }
    } catch (error) {
      addMessage(`Error starting Unreal Engine: ${error.message}`, false);
    }
  };

  const addMessage = (text, isUser = true) => {
    const newMessage = {
      id: Date.now(),
      text,
      isUser,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    addMessage(userMessage, true);
    setIsLoading(true);

    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.sendChatMessage(userMessage);
        
        if (result.success) {
          // Add the AI response
          addMessage(result.response, false);
          
          // Update service availability based on response
          setIsElevenLabsAvailable(result.audioGenerated);
          setIsChatGPTAvailable(true);
          
          // Update NeuroSync status when text_to_face succeeds
          if (result.neurosyncConnected) {
            setIsNeuroSyncConnected(true);
          }
          
          // Add a status message if audio generation failed
          if (!result.audioGenerated) {
            addMessage(`ℹ️ ${result.message}`, false);
          }
        } else {
          addMessage(`Error: ${result.error}`, false);
          setIsChatGPTAvailable(false);
        }
      }
    } catch (error) {
      addMessage(`Error processing message: ${error.message}`, false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const refreshCaptureSources = async () => {
    try {
      if (window.electronAPI) {
        const sources = await window.electronAPI.getCaptureSources();
        setCaptureSources(sources);
        console.log('Available capture sources:', sources);
      }
    } catch (error) {
      console.error('Error getting capture sources:', error);
    }
  };

  const startCapture = async () => {
    if (!selectedSource) return;
    
    try {
      setIsCapturing(true);
      
      // Get the stream from the selected source
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: selectedSource
          }
        }
      });
      
      setGameStream(stream);
      console.log('Started capturing game window');
    } catch (error) {
      console.error('Error starting capture:', error);
      setIsCapturing(false);
    }
  };

  const stopCapture = () => {
    if (gameStream) {
      gameStream.getTracks().forEach(track => track.stop());
      setGameStream(null);
    }
    setIsCapturing(false);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const checkTcpConnection = async () => {
    try {
      if (window.electronAPI) {
        const status = await window.electronAPI.getTcpQueueStatus();
        setTcpConnected(status.isConnected && status.isServerRunning);
        console.log('TCP connection status:', status);
      }
    } catch (error) {
      console.error('Error checking TCP connection:', error);
      setTcpConnected(false);
    }
  };

  return (
    <AppContainer>
      <Header>
        <Title>
          <Bot size={24} />
          Metahuman VTuber
        </Title>
        {isElectron && (
          <StatusIndicator>
            <ServiceStatus>
              <StatusDot $connected={isGameRunning} />
              Game
            </ServiceStatus>
            <ServiceStatus>
              <StatusDot $connected={isNeuroSyncConnected} />
              NeuroSync
            </ServiceStatus>
            <ServiceStatus>
              <StatusDot $connected={isElevenLabsAvailable} />
              ElevenLabs
            </ServiceStatus>
            <ServiceStatus>
              <StatusDot $connected={isChatGPTAvailable} />
              ChatGPT
            </ServiceStatus>
            <ServiceStatus>
              <StatusDot $connected={tcpConnected} />
              TCP
            </ServiceStatus>
          </StatusIndicator>
        )}
      </Header>

      <MainContent>
        <GameViewContainer>
          <GameViewHeader>
            <GameViewTitle>
              🎮 Metahuman Stream
            </GameViewTitle>
            {isElectron && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {isGameRunning && (
                  <CaptureButton $isCapturing={false} onClick={refreshCaptureSources}>
                    🔄 Refresh Windows
                  </CaptureButton>
                )}
                <ConnectionButton
                  $connected={isUnrealConnected}
                  onClick={handleStartUnrealEngine}
                  disabled={isLoading}
                >
                  <Play size={16} />
                  {isGameRunning ? 'Game Running' : isUnrealConnected ? 'Connected' : 'Start Game'}
                </ConnectionButton>
              </div>
            )}
          </GameViewHeader>

          <GameViewContent>
            {gameStream ? (
              <>
                <GameStatus>
                  <StatusDot $connected={true} />
                  Live Stream
                </GameStatus>
                <GameVideoWrapper>
                  <CroppedVideoWrapper>
                    <CroppedGameVideo
                      ref={videoRef}
                      autoPlay
                      muted
                    />
                  </CroppedVideoWrapper>
                </GameVideoWrapper>
                {isElectron && (
                  <CaptureControls>
                    <CaptureButton $isCapturing={true} onClick={stopCapture}>
                      Stop Capture
                    </CaptureButton>
                  </CaptureControls>
                )}
              </>
            ) : isGameRunning ? (
              <>
                <GameStatus>
                  <StatusDot $connected={true} />
                  Game Running
                </GameStatus>
                <GamePlaceholder $isRunning={true}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎭</div>
                  <div>Metahuman is ready for conversation!</div>
                  <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.7 }}>
                    Select the game window below to start streaming
                  </div>
                </GamePlaceholder>
                {isElectron && (
                  <CaptureControls>
                    <SourceSelect
                      value={selectedSource}
                      onChange={(e) => setSelectedSource(e.target.value)}
                    >
                      <option value="">Select Game Window</option>
                      {captureSources.map((source) => (
                        <option key={source.id} value={source.id}>
                          {source.name}
                        </option>
                      ))}
                    </SourceSelect>
                    <CaptureButton $isCapturing={false} onClick={startCapture} disabled={!selectedSource}>
                      Start Capture
                    </CaptureButton>
                    <CaptureButton $isCapturing={false} onClick={refreshCaptureSources}>
                      Refresh
                    </CaptureButton>
                  </CaptureControls>
                )}
              </>
            ) : (
              <GamePlaceholder $isRunning={false}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎮</div>
                <div>Click "Start Game" to begin the metahuman experience</div>
                <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.7 }}>
                  The game will launch automatically when ready
                </div>
              </GamePlaceholder>
            )}
          </GameViewContent>
        </GameViewContainer>

        <ChatSection>
          <ChatContainer>
            <ChatHeader>
              <ChatTitle>
                <MessageCircle size={20} />
                Chat with Metahuman
              </ChatTitle>
            </ChatHeader>

            <ChatScrollBox ref={messagesEndRef}>
              {messages.map((message) => (
                <Message key={message.id}>
                  <MessageAvatar $isUser={message.isUser}>
                    {message.isUser ? <User size={20} /> : <Bot size={20} />}
                  </MessageAvatar>
                  <MessageContent $isUser={message.isUser}>
                    {message.text}
                  </MessageContent>
                </Message>
              ))}
              
              {isLoading && (
                <Message>
                  <MessageAvatar $isUser={false}>
                    <Bot size={20} />
                  </MessageAvatar>
                  <MessageContent $isUser={false}>
                    <LoadingMessage>
                      Processing your message
                      <LoadingDots>
                        <div></div>
                        <div></div>
                        <div></div>
                      </LoadingDots>
                    </LoadingMessage>
                  </MessageContent>
                </Message>
              )}
              
              <div ref={messagesEndRef} />
            </ChatScrollBox>

            <InputContainer>
              <InputWrapper>
                <ChatInput
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  disabled={isLoading}
                  rows={1}
                />
              </InputWrapper>
              <SendButton
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
              >
                <Send size={20} />
              </SendButton>
            </InputContainer>
          </ChatContainer>
        </ChatSection>
      </MainContent>
    </AppContainer>
  );
}

export default App; 