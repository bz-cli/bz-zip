#!/usr/bin/env node
import fs from "fs";
import path from 'path';
import JSZip from "jszip";
import program from 'commander';
import { gray, cyan, green, red, yellow, white } from 'chalk';
import zipper from './lib/zipper';
const { log } = console;

program
    .version('1.1.0')
    .option('-f --folder [folder]', 'Specifies the .BIZC file name. Must match the target folder.')
    .parse(process.argv)

if(!program.folder) {
    log(red.bold(`✘ Connector name not specified.`));
} else {
    log(yellow.bold(`Preparing to zip connector ... ✈`));

    zipper
    	.init({ fs, path, JSZip })
    	.zip(program.folder)
        .then(() => log(green.bold(`✿ Connector bundled successfully ✿`)))
        .catch(err => log(red.bold(`✘ An error ocurrer while zipping your connector.\n${err.message}`)));
}
