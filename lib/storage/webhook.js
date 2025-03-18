const https = require('https');
const http = require('http');

/**
 * Webhook storage implementation for audit logs
 */
class WebhookStorage {
  /**
   * @param {Object} options - Webhook storage options
   * @param {string} options.url - Webhook URL
   * @param {Object} [options.headers={}] - HTTP headers
   * @param {number} [options.timeout=5000] - Request timeout in ms
   * @param {boolean} [options.validateStatus=true] - Whether to validate response status
   */
  constructor(options) {
    if (!options || !options.url) {
      throw new Error('Webhook URL is required');
    }

    this.url = options.url;
    this.headers = options.headers || {
      'Content-Type': 'application/json'
    };
    this.timeout = options.timeout || 5000;
    this.validateStatus = options.validateStatus !== false;
  }

  /**
   * Save audit log by sending to webhook
   * @param {Object} logEntry - Audit log entry
   * @returns {Promise<void>}
   */
  async saveLog(logEntry) {
    return new Promise((resolve, reject) => {
      try {
        const url = new URL(this.url);
        const isHttps = url.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const requestOptions = {
          method: 'POST',
          hostname: url.hostname,
          port: url.port || (isHttps ? 443 : 80),
          path: url.pathname + url.search,
          headers: this.headers,
          timeout: this.timeout
        };

        const req = client.request(requestOptions, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            if (this.validateStatus && (res.statusCode < 200 || res.statusCode >= 300)) {
              reject(new Error(`Webhook request failed with status ${res.statusCode}: ${data}`));
            } else {
              resolve();
            }
          });
        });

        req.on('error', (error) => {
          reject(new Error(`Webhook request failed: ${error.message}`));
        });

        req.on('timeout', () => {
          req.destroy();
          reject(new Error(`Webhook request timed out after ${this.timeout}ms`));
        });

        req.write(JSON.stringify(logEntry));
        req.end();
      } catch (error) {
        console.error('Failed to send audit log to webhook:', error);
        reject(error);
      }
    });
  }
}

module.exports = WebhookStorage; 