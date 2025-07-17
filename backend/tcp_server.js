const net = require('net');

class UnrealTCPServer {
  constructor(port = 7777) {
    this.port = port;
    this.server = null;
    this.clients = new Set();
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = net.createServer((socket) => {
        console.log('🔌 Client connected to TCP server');
        this.clients.add(socket);

        socket.on('data', (data) => {
          const command = data.toString().trim();
          const rawBytes = Array.from(data).map(b => b.toString(16).padStart(2, '0')).join(' ');
          console.log(`📨 TCP Server received: "${command}"`);
          console.log(`📨 Raw bytes: [${rawBytes}] (length: ${data.length})`);
          
          // Echo back to confirm receipt
          socket.write(`Received: ${command}\n`);
        });

        socket.on('end', () => {
          console.log('🔌 Client disconnected from TCP server');
          this.clients.delete(socket);
        });

        socket.on('error', (err) => {
          console.error('❌ TCP Server client error:', err);
          this.clients.delete(socket);
        });
      });

      this.server.listen(this.port, '127.0.0.1', () => {
        console.log(`🚀 TCP Server listening on port ${this.port}`);
        resolve();
      });

      this.server.on('error', (err) => {
        console.error('❌ TCP Server error:', err);
        reject(err);
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        // Close all client connections
        for (const client of this.clients) {
          client.destroy();
        }
        this.clients.clear();

        this.server.close(() => {
          console.log('🛑 TCP Server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  isRunning() {
    return this.server && this.server.listening;
  }
}

module.exports = UnrealTCPServer; 