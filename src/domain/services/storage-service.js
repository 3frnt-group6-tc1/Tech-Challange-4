export class IStorageService {
  async getItem(key) {
    throw new Error("Method not implemented");
  }

  async setItem(key, value) {
    throw new Error("Method not implemented");
  }

  async removeItem(key) {
    throw new Error("Method not implemented");
  }

  async clear() {
    throw new Error("Method not implemented");
  }
}

class SecureStorageService extends IStorageService {
  constructor(secureStore) {
    super();
    this.secureStore = secureStore;
  }

  async getItem(key) {
    try {
      const value = await this.secureStore.getItemAsync(key);
      return value;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  async setItem(key, value) {
    try {
      await this.secureStore.setItemAsync(key, value);
      return true;
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      return false;
    }
  }

  async removeItem(key) {
    try {
      await this.secureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      return false;
    }
  }

  async clear() {
    console.warn("SecureStore does not support clear all operation");
    return false;
  }

  async getJSON(key) {
    try {
      const value = await this.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error parsing JSON for key ${key}:`, error);
      return null;
    }
  }

  async setJSON(key, value) {
    try {
      const stringified = JSON.stringify(value);
      return await this.setItem(key, stringified);
    } catch (error) {
      console.error(`Error stringifying JSON for key ${key}:`, error);
      return false;
    }
  }
}

class LocalStorageService extends IStorageService {
  constructor(asyncStorage) {
    super();
    this.asyncStorage = asyncStorage;
  }

  async getItem(key) {
    try {
      const value = await this.asyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  async setItem(key, value) {
    try {
      await this.asyncStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      return false;
    }
  }

  async removeItem(key) {
    try {
      await this.asyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      return false;
    }
  }

  async clear() {
    try {
      await this.asyncStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing storage:", error);
      return false;
    }
  }

  async getJSON(key) {
    try {
      const value = await this.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error parsing JSON for key ${key}:`, error);
      return null;
    }
  }

  async setJSON(key, value) {
    try {
      const stringified = JSON.stringify(value);
      return await this.setItem(key, stringified);
    } catch (error) {
      console.error(`Error stringifying JSON for key ${key}:`, error);
      return false;
    }
  }
}

export const createStorageService = (type, implementation) => {
  switch (type) {
    case "secure":
      return new SecureStorageService(implementation);
    case "local":
      return new LocalStorageService(implementation);
    default:
      throw new Error(`Unknown storage type: ${type}`);
  }
};

export { SecureStorageService, LocalStorageService };
