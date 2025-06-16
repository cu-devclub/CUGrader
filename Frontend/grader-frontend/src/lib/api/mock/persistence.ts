import * as devalue from "devalue";
import { Class, Instructor, Semester, Student, TeachingAssistant } from "../type";

// Type declarations for OPFS API (in case they're not available)
declare global {
  interface Navigator {
    storage: {
      getDirectory(): Promise<FileSystemDirectoryHandle>;
    };
  }
}

export type DbClass = Omit<Class, "imageUrl"> & {
  students: DbStudent[];
  semester: Semester; // TODO: move this to normal api response later
  assistants: DbAssistant[];
  instructors: DbInstructor[];

  imageFileId?: string;
};

export type DbStudent = Omit<Student, "maxScore" | "imageUrl"> & {
  imageFileId?: string;
};

export type DbInstructor = Omit<Instructor, ""> & {
  email: string;
  imageFileId?: string;
};

export type DbAssistant = TeachingAssistant & {
  email: string;
  imageFileId?: string;
};

// claude wrote most of this
export class Persistence<Data> {
  data!: Data;
  id: string;
  fresh: boolean = false;
  private urlCache: Map<string, string> = new Map();
  private initialData: Data;

  constructor(id: string, initialData: Data) {
    this.id = id;
    this.initialData = initialData;

    // react will complain about hydration mismatch 
    if (!globalThis.window) {
      this.data = initialData;
      return;
    }

    const existing = localStorage.getItem(`persistence-${this.id}`);
    if (existing) {
      this.data = devalue.parse(existing);
      this.fresh = false;
    } else {
      this.data = initialData;
      this.fresh = true;
    }
  }

  persist() {
    if (!globalThis.window) {
      return;
    }
    localStorage.setItem(`persistence-${this.id}`, devalue.stringify(this.data));
  }

  private async getOPFSDirectory() {
    const opfsRoot = await navigator.storage.getDirectory();
    const folderName = `persistence-${this.id}`;
    return await opfsRoot.getDirectoryHandle(folderName, { create: true });
  }

  async getFile(id: string): Promise<File | undefined> {
    // console.log("Getting file " + id);
    try {
      const persistenceDir = await this.getOPFSDirectory();
      const fileHandle = await persistenceDir.getFileHandle(id);
      const f = await fileHandle.getFile();
      // console.log(f);
      return f;
    } catch (error) {
      console.warn(`Failed to get file ${id} from OPFS:`, error);
      return undefined;
    }
  }

  async getFileUrl(id: string): Promise<string | undefined> {
    try {
      // Check if URL is already cached
      if (this.urlCache.has(id)) {
        return this.urlCache.get(id);
      }

      const file = await this.getFile(id);
      if (file) {
        const url = URL.createObjectURL(file);
        this.urlCache.set(id, url);
        return url;
      }
      return undefined;
    } catch (error) {
      console.warn(`Failed to get file URL for ${id}:`, error);
      return undefined;
    }
  }

  async saveFile(file: File): Promise<string> {
    console.log("Saving file " + file.name);
    try {
      const id = `${Date.now()}-${crypto.randomUUID()}`;
      const persistenceDir = await this.getOPFSDirectory();
      const fileHandle = await persistenceDir.getFileHandle(id, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(file);
      await writable.close();
      return id;
    } catch (error) {
      console.error('Failed to save file to OPFS:', error);
      throw error;
    }
  }

  async deleteFile(id: string): Promise<boolean> {
    try {
      const persistenceDir = await this.getOPFSDirectory();
      await persistenceDir.removeEntry(id);

      // Clean up cached URL if it exists
      const cachedUrl = this.urlCache.get(id);
      if (cachedUrl) {
        URL.revokeObjectURL(cachedUrl);
        this.urlCache.delete(id);
      }

      return true;
    } catch (error) {
      console.warn(`Failed to delete file ${id} from OPFS:`, error);
      return false;
    }
  }

  async listFiles(): Promise<string[]> {
    try {
      const persistenceDir = await this.getOPFSDirectory();
      const fileIds: string[] = [];

      // @ts-ignore - OPFS entries() method might not be in types yet
      for await (const [name, handle] of persistenceDir.entries()) {
        if (handle.kind === 'file') {
          fileIds.push(name);
        }
      }

      return fileIds;
    } catch (error) {
      console.warn('Failed to list files from OPFS:', error);
      return [];
    }
  }

  /**
   * Revoke all cached object URLs to free up memory
   */
  revokeCachedUrls(): void {
    for (const url of this.urlCache.values()) {
      URL.revokeObjectURL(url);
    }
    this.urlCache.clear();
  }

  /**
   * Revoke a specific cached URL
   */
  revokeCachedUrl(id: string): boolean {
    const cachedUrl = this.urlCache.get(id);
    if (cachedUrl) {
      URL.revokeObjectURL(cachedUrl);
      this.urlCache.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Reset all data and files to initial state
   */
  async reset(): Promise<void> {
    try {
      // Clear localStorage
      localStorage.removeItem(`persistence-${this.id}`);

      // Reset data to initial state
      this.data = this.initialData;
      this.fresh = true;

      // Revoke all cached URLs
      this.revokeCachedUrls();

      // Clear all files from OPFS
      try {
        const persistenceDir = await this.getOPFSDirectory();

        // @ts-ignore - OPFS entries() method might not be in types yet
        for await (const [name, handle] of persistenceDir.entries()) {
          if (handle.kind === 'file') {
            await persistenceDir.removeEntry(name);
          }
        }
      } catch (error) {
        console.warn('Failed to clear files from OPFS during reset:', error);
      }

      console.log(`Persistence ${this.id} has been reset to initial state`);
    } catch (error) {
      console.error('Failed to reset persistence:', error);
      throw error;
    }
  }
}
