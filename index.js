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

// delete .git folder
fs.rmdirSync('.git', { recursive: true }, (error) => {
    if(error) {
        throw error;
    } else {
        console.log(chalk.blue.bold(`.git folder deleted.`));
    }
});

// scaffold new laravel application
const laravel = spawn("laravel", ["new", "src"]);
// once finished copy and clean diles
laravel.on("close", code => {
    // copy readme
    fs.copyFileSync('_templates/README.md','README.md', fs.constants.COPYFILE_FICLONE, (error) => {
        if(error){
            console.error(chalk.red.bold("Error copying README"));
            return;
        }
        console.log(chalk.blue.bold("Copied README.md from templates"));
    });

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

});

const git = spawn("git", ["init"]);
git.on("close", code => {
    // prompt for env variables
    const questions = [
        {
            type: 'text',
            name: 'project_name',
            message: 'PROJECT_NAME'
        },
        {
            type: 'number',
            name: 'http_port',
            message: 'HTTP_PORT',
            initial: 8000
        },
        {
            type: 'number',
            name: 'mysql_port',
            message: 'MYSQL_PORT',
            initial: 3306
        },
        {
            type: 'text',
            name: 'mysql_database',
            message: 'MYSQL_DATABASE',
            initial: 'laraveldb'
        },
        {
            type: 'text',
            name: 'mysql_user',
            message: 'MYSQL_USER',
            initial: 'dbuser'
        },
        {
            type: 'text',
            name: 'mysql_password',
            message: 'PROJECT_NAME',
            initial: 'dbpassword'
        },
    ];

    (async () => {
        const response = await prompts(questions);
        writeEnvToRoot(response);
    })();

    console.log(boxen( chalk.white.bold("Laravel development environment complete."), boxenOptions ));
});



function writeEnvToRoot(response){
    // override env
    fs.open('.env', 'w', function (err) {
        if (err) throw err;
    });

    const keys = Object.keys(response);

    keys.forEach((key, index) => {
        fs.appendFile('.env', `${key.toUpperCase()}=${response[key]} \n`,(error)=>{
            if(error){
                throw error;
            }
        });
    });

    updatePackageJson(response);
}

function updatePackageJson(response){
    try {
        let changedFile = replace.sync({
            files: 'package.json',
            from: '<PROJECT_NAME>',
            to: `${response['project_name']}_php`
        });
        console.log(chalk.blue.bold(`package.json updated.`));
    } catch (error) {
        console.error(chalk.red.bold("Error updating package.json. Please update docker:remote in scripts."));
    }
}


