#!/usr/bin/env node

const fs = require("fs");
const { spawn } = require('child_process');
const replace = require('replace-in-file');
const chalk = require("chalk");
const boxen = require("boxen");
const boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "blue",
    backgroundColor: "#555555"
};
const prompts = require('prompts');


console.log(boxen( chalk.white.bold("Setting up your laravel development environment ..."), boxenOptions ));
// prompt for env variables
const questions = [
    {
        type: 'text',
        name: 'project_name',
        message: 'PROJECT_NAME'
    },
    {
        type: 'text',
        name: 'http_port',
        message: 'HTTP_PORT (8000)'
    },
    {
        type: 'text',
        name: 'mysql_port',
        message: 'MYSQL_PORT (3306)'
    }
];

(async () => {
    const response = await prompts(questions);

    fs.writeFile('.env', response, function(err){
        if (err) return console.log(err);
    })
})();

// delete .git folder
fs.rmdirSync('.git', { recursive: true }, (error) => {
    if(error) {
        throw error;
    } else {
        console.log(chalk.blue.bold(`.git folder deleted.`));
    }
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

    // exit the process
    process.exit(0);
});

