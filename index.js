#!/usr/bin/env node
const program = require('commander');
const JSZip = require('jszip');
const zipper = require('./lib/zipper');

program.version('1.1.0').description('Develop custom connectors for Bizagi Studio blazingly fast.');

program
  .command('compress <folder>')
  .description('Compress the specified folder.')
  .action((folder) => {
    zipper
      .init({ JSZip })
      .zip(folder)
      .then(() => console.log('Connector bundled successfully'))
      .catch((err) => {
        console.error('An error ocurrer while zipping your connector.', err.message, err.stack);
      });
  });

program.parse(process.argv);
