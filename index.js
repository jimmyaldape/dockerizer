#!/usr/bin/env node
const chalk = require("chalk");
const boxen = require("boxen");
const fs = require("fs");
const { spawn } = require('child_process');
const replace = require('replace-in-file');
const boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "blue",
    backgroundColor: "#555555"
};

console.log(boxen( chalk.white.bold("Setting up your laravel development environment ..."), boxenOptions ));
// delete .git folder
fs.rmdirSync('.git', { recursive: true }, (error) => {
    if(error) {
        throw error;
    } else {
        console.log(chalk.blue.bold(`.git folder deleted.`));
    }
});
// copy env
fs.copyFileSync('_templates/.env.example','.env', fs.constants.COPYFILE_FICLONE, (error) =>{
    if(error){
        console.error(chalk.red.bold("Error copying env file"));
        return;
    }
    require('dotenv').config();
    console.log(chalk.blue.bold("Copied env file from templates"));
});
// copy readme
fs.copyFileSync('_templates/README.md','README.md', fs.constants.COPYFILE_FICLONE, (error) => {
    if(error){
        console.error(chalk.red.bold("Error copying README"));
        return;
    }
    console.log(chalk.blue.bold("Copied README.md from templates"));
});
// scaffold new laravel application
const laravel = spawn("laravel", ["new", "src"]);
// once finished override the .gitignore file and announce completion
laravel.on("close", code => {

    fs.copyFileSync('_templates/.gitignore.example','src/.gitignore', fs.constants.COPYFILE_FICLONE, (error) =>{
        if(error){
            console.error(chalk.red.bold("Error copying ignore file"));
            return;
        }
    });

    fs.rmdirSync('_templates', { recursive: true }, (error) => {
        if(error) {
            throw error;
        } else {
            console.log(chalk.blue.bold(`_templates folder deleted.`));
        }
    });

    try {
        let changedFile = replace.sync({
            files: 'package.json',
            from: '<PROJECT_NAME>',
            to: process.env.PROJECT_NAME
        });
        console.log(chalk.blue.bold(`package.json updated.`));
    } catch (error) {
        console.error(chalk.red.bold("Error updating package.json. Please update docker:remote in scripts."));
    }

    const git = spawn("git", ["init"]);
    git.on("close", code => {
        console.log(boxen( chalk.white.bold("Laravel development environment complete."), boxenOptions ));
    });
});


