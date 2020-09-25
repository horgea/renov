var fs = require('fs');
var unzipper = require('unzipper');

export function range(start: number, stop: number, step: number) {
  return Array.from(
    { length: (stop - start) / step + 1 },
    (_, i) => start + i * step
  );
}


export function readFromZip(zipFile: string) {
  fs.createReadStream(zipFile)
  .pipe(unzipper.Parse())
  .on('entry', function (entry:any) {
      return entry.path
      //entry.autodrain();
  })
}
