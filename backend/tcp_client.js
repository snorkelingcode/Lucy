const net = require('net');

class UnrealTCPClient {
  constructor(host = '127.0.0.1', port = 7777) {
    this.host = host;
    this.port = port;
    this.client = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.commandQueue = [];
    this.isProcessing = false;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.client = new net.Socket();
      
      this.client.on('connect', () => {
        console.log('Connected to Unreal Engine');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve();
      });

      this.client.on('data', (data) => {
        console.log('Received from Unreal Engine:', data.toString());
      });

      this.client.on('error', (error) => {
        console.error('TCP connection error:', error);
        this.isConnected = false;
        reject(error);
      });

      this.client.on('close', () => {
        console.log('TCP connection closed');
        this.isConnected = false;
        this.attemptReconnect();
      });

      this.client.connect(this.port, this.host, () => {
        console.log(`Connected to ${this.host}:${this.port}`);
      });
    });
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, 2000 * this.reconnectAttempts); // Exponential backoff
    }
  }

  // Send a single command (open a new connection for each command)
  sendCommand(command) {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      client.connect(this.port, this.host, () => {
        // Always send with a newline, matching the Python script
        const message = command + '\n';
        client.write(message, (error) => {
          if (error) {
            console.error('Error sending command:', error);
            client.destroy();
            reject(error);
          } else {
            console.log('Command sent:', command);
            client.end();
            resolve();
          }
        });
      });
      client.on('error', (error) => {
        console.error('TCP connection error:', error);
        reject(error);
      });
    });
  }

  // Stream multiple commands in sequence
  async streamCommands(commands, delayMs = 100) {
    if (!this.isConnected || !this.client) {
      throw new Error('Not connected to Unreal Engine');
    }

    console.log(`Streaming ${commands.length} commands to Unreal Engine...`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      try {
        await this.sendCommand(command);
        
        // Add delay between commands (except for the last one)
        if (i < commands.length - 1 && delayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        console.error(`Error sending command ${i + 1}/${commands.length}:`, error);
        throw error;
      }
    }
    
    console.log('Command stream completed');
  }

  // Queue a command for later execution
  queueCommand(command) {
    this.commandQueue.push(command);
    console.log(`Command queued: ${command} (${this.commandQueue.length} in queue)`);
  }

  // Process all queued commands
  async processQueue(delayMs = 100) {
    if (this.isProcessing || this.commandQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const commands = [...this.commandQueue];
    this.commandQueue = [];

    try {
      await this.streamCommands(commands, delayMs);
    } catch (error) {
      console.error('Error processing command queue:', error);
      // Put commands back in queue on error
      this.commandQueue.unshift(...commands);
    } finally {
      this.isProcessing = false;
    }
  }

  sendBlendshapes(blendshapes) {
    // Send blendshape data to Unreal Engine
    // This is a simplified version - you may need to format the data differently
    const blendshapeCommand = `BLENDSHAPES.${JSON.stringify(blendshapes)}`;
    return this.sendCommand(blendshapeCommand);
  }

  sendAudioData(audioData) {
    // Send audio data to Unreal Engine
    // This is a placeholder - you may need to implement actual audio streaming
    const audioCommand = `AUDIO.${audioData.length}bytes`;
    return this.sendCommand(audioCommand);
  }

  startSpeaking() {
    return this.sendCommand('startspeaking');
  }

  stopSpeaking() {
    return this.sendCommand('stopspeaking');
  }

  // Send multiple emote commands in sequence
  async sendEmoteSequence(emotes, delayMs = 100) {
    return this.streamCommands(emotes, delayMs);
  }

  // Get queue status
  getQueueStatus() {
    return {
      queueLength: this.commandQueue.length,
      isProcessing: this.isProcessing,
      isConnected: this.isConnected
    };
  }

  // Test multiple ports to find the Unreal Engine TCP server
  async testPorts(ports = [7777, 7778, 7779, 7780, 11111]) {
    console.log('🔍 Testing ports to find Unreal Engine TCP server...');
    
    for (const port of ports) {
      try {
        console.log(`Testing port ${port}...`);
        const testClient = new net.Socket();
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            testClient.destroy();
            reject(new Error('Connection timeout'));
          }, 1000);
          
          testClient.on('connect', () => {
            clearTimeout(timeout);
            console.log(`✅ Found TCP server on port ${port}!`);
            testClient.destroy();
            resolve(port);
          });
          
          testClient.on('error', (error) => {
            clearTimeout(timeout);
            testClient.destroy();
            reject(error);
          });
          
          testClient.connect(port, this.host);
        });
        
        // If we get here, we found a working port
        this.port = port;
        console.log(`🎯 Using port ${port} for TCP communication`);
        return port;
        
      } catch (error) {
        console.log(`❌ Port ${port} failed: ${error.message}`);
      }
    }
    
    throw new Error('No TCP server found on any tested port');
  }

  disconnect() {
    if (this.client) {
      this.client.destroy();
      this.isConnected = false;
    }
  }
}

module.exports = UnrealTCPClient; 