import { readdir } from 'fs';
import { join } from 'path';

export function listDirectory(ref) {
  return new Promise((resolve, reject) => {
    readdir(ref, (err, results) => err
      ? reject(err)
      : resolve(results.map(result => join(ref, result))),
    );
  });
}
