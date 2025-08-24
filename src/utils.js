import fs from 'fs';

export function applyDelay(delayRange) {
  return new Promise((resolve) => {
    let minDelay = 0;
    let maxDelay = 0;
    
    if (typeof delayRange === 'string') {
      if (delayRange.includes('-') && !delayRange.startsWith('-')) {
        // Handle range format like "100-200" but not "-100" or "-100-200"
        [minDelay, maxDelay] = delayRange.split('-').map(Number);
      } else {
        minDelay = maxDelay = Number(delayRange);
      }
    } else {
      minDelay = maxDelay = Number(delayRange);
    }
    
    // Ensure valid delay values - convert negative values to 0
    if (isNaN(minDelay) || minDelay < 0) {
      minDelay = 0;
    }
    if (isNaN(maxDelay) || maxDelay < 0) {
      maxDelay = 0;
    }
    
    // If both delays are 0, resolve immediately
    if (minDelay === 0 && maxDelay === 0) {
      resolve();
      return;
    }
    
    // If min and max are the same, use that value
    if (minDelay === maxDelay) {
      setTimeout(resolve, minDelay);
      return;
    }
    
    // Generate random delay within range
    const actualDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    setTimeout(resolve, actualDelay);
  });
}

export function setupHotReload(filePath, callback) {
  try {
    // Simple file watching for hot reload
    let lastModified = fs.statSync(filePath).mtime.getTime();
    
    const checkFile = () => {
      try {
        const stats = fs.statSync(filePath);
        const currentModified = stats.mtime.getTime();
        
        if (currentModified > lastModified) {
          lastModified = currentModified;
          callback();
        }
      } catch (error) {
        // File might have been deleted or moved
        console.warn('Warning: Could not check file for hot reload:', error.message);
      }
    };
    
    // Check every 2 seconds
    const interval = setInterval(checkFile, 2000);
    
    // Cleanup function
    return () => {
      clearInterval(interval);
    };
  } catch (error) {
    console.warn('Warning: Hot reload not available:', error.message);
    return () => {};
  }
}

export function validatePort(port) {
  const portNum = parseInt(port, 10);
  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    throw new Error(`Invalid port number: ${port}. Must be between 1 and 65535.`);
  }
  return portNum;
}

export function validateDelayRange(delay) {
  if (delay === '0') return delay;
  
  if (typeof delay === 'string' && delay.includes('-')) {
    const [min, max] = delay.split('-').map(Number);
    if (isNaN(min) || isNaN(max) || min < 0 || max < 0 || min > max) {
      throw new Error(`Invalid delay range: ${delay}. Must be in format "min-max" where min <= max.`);
    }
  } else {
    const delayNum = Number(delay);
    if (isNaN(delayNum) || delayNum < 0) {
      throw new Error(`Invalid delay: ${delay}. Must be a positive number.`);
    }
  }
  
  return delay;
}

export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return formatBytes(stats.size);
  } catch (error) {
    return 'Unknown';
  }
}
