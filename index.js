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
let project_name = '';

console.log(boxen( chalk.white.bold("Setting up your laravel development environment ..."), boxenOptions ));

(async ()=> {
    const response = await prompts(questions);
    project_name = response['project_name'];
    createProjectDirectory(response);

    // scaffold new laravel application
    const laravel = spawn("laravel", ["new", `../${project_name}/src`]);
    // once finished copy and clean files
    laravel.on("close", code => {
        fs.copyFileSync('_templates/.gitignore.example',`../${project_name}/src/.gitignore`, fs.constants.COPYFILE_FICLONE, (error) =>{
            if(error){
                throw error;
            }
            console.log(chalk.blue.bold("Copied .gitignore from templates"));
        });

        const git = spawn("git", ["init", `../${project_name}`]);
        git.on("close", code => {
            console.log(boxen( chalk.white.bold("Laravel development environment complete."), boxenOptions ));
        });
    });
})();



function createProjectDirectory(response){
    let directory = `../${response['project_name']}`;
    if(!fs.existsSync(directory)){
        fs.mkdirSync(directory);
    }

    writeEnvToRoot(response);
    copyTemplateFiles();
}

function writeEnvToRoot(response){
    let file = `../${project_name}/.env`;
    // override env
    fs.open(file, 'w', function (err) {
        if (err) throw err;
    });

    const keys = Object.keys(response);

    keys.forEach((key, index) => {
        fs.appendFile(file, `${key.toUpperCase()}=${response[key]} \n`,(error)=>{
            if(error){
                throw error;
            }
        });
    });
}

function copyTemplateFiles(){
    fs.copyFileSync('_templates/package.json.example',`../${project_name}/package.json`, fs.constants.COPYFILE_FICLONE, (error) => {
        if(error){
            throw error;
        }
        console.log(chalk.blue.bold("Copied package.json from templates"));
    });
    fs.copyFileSync('_templates/README.md',`../${project_name}/README.md`, fs.constants.COPYFILE_FICLONE, (error) => {
        if(error){
            throw error;
        }
        console.log(chalk.blue.bold("Copied README.md from templates"));
    });

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
