#!/usr/bin/env node

const chalk = require("chalk");
const boxen = require("boxen");

const fs = require("fs");
const { spawn } = require('child_process');

const boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "blue",
    backgroundColor: "#555555"
};

console.log(boxen( chalk.white.bold("Setting up your laravel development environment ..."), boxenOptions ));

// TODO: delete .git folder
const gitDir = '.git';
fs.rmdir(gitDir, { recursive: true }, (err) => {
    if(err) {
        throw err;
    }

    console.log(chalk.blue.bold(`${gitDir} is deleted!`));
});

// copy readme
fs.copyFile('_templates/README.md','README.md', fs.constants.COPYFILE_FICLONE, (error) =>{
    if(error){
        console.error(chalk.red.bold("Error copying README"));
        return;
    }
    console.log(chalk.blue.bold("Copied README.md from templates"));
});

// copy env
fs.copyFile('_templates/.env.example','.env', fs.constants.COPYFILE_FICLONE, (error) =>{
    if(error){
        console.error(chalk.red.bold("Error copying env file"));
        return;
    }
    console.log(chalk.blue.bold("Copied env file from templates"));
});

// scaffold new laravel application
const laravel = spawn("laravel", ["new", "src"]);

// once finished override the .gitignore file and announce completion
laravel.on("close", code => {

    fs.copyFile('_templates/.gitignore.example','src/.gitignore', fs.constants.COPYFILE_FICLONE, (error) =>{
        if(error){
            console.error(chalk.red.bold("Error copying ignore file"));
            return;
        }
    });

    console.log(boxen( chalk.white.bold("Laravel development environment complete"), boxenOptions ));
});
