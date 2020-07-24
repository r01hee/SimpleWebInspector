const archiver = require('archiver');
const fs = require('fs');
const resolve = require('path').resolve

const { argv } = process;

if (argv.length < 4) {
    console.log(`${argv[0]} ${argv[1]} [path] [zipfile]`);
    process.exit(1);
}

const zipfile = resolve(argv[3]);

process.chdir(argv[2]);

const archive = archiver.create('zip', { zlib: { level: 0 } });
const output = fs.createWriteStream(zipfile);

archive.pipe(output);

archive.glob('**/*');

archive.finalize();