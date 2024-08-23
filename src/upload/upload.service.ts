import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  async uploadToBunny(filePath: string): Promise<void> {
    const fileStream = fs.createReadStream(filePath);
    const apiKey = 'BUNNY_NET_API_KEY';
    const storageZone = 'STORAGE_ZONE_NAME';

    const response = await fetch(
      `https://storage.bunnycdn.com/${storageZone}/${path.basename(filePath)}`,
      {
        method: 'PUT',
        headers: {
          AccessKey: apiKey,
          'Content-Type': 'application/octet-stream',
        },
        body: fileStream,
      },
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
  }
}
