import * as fs from 'fs';
import * as path from 'path';

// For correct using of data-courses file __ IMPORTANT
export function __readCoursesData(): any {
  const basePath =
    process.env.NODE_ENV === 'production'
      ? path.join(__dirname, '..', 'data') // Production: use dist/data
      : path.join(process.cwd(), 'src', 'data'); // Development: use src/data

  const filePath = path.join(basePath, 'courses-data.json'); // Full path to data.json

  if (!fs.existsSync(filePath)) {
    throw new Error('courses-data.json file not found');
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}
