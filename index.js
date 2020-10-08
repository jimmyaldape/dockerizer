#!/usr/bin/env node

const fs = require("fs");
const fsx = require("fs-extra");
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
        type: 'select',
        name: 'project_type',
        message: 'Which project framework would you like to use?',
        choices: [
            { title: 'Laravel', value: 'laravel' },
            { title: 'Statamic', value: 'statamic' }
        ],
        initial: 0
    },
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
        message: 'MYSQL_PASSWORD',
        initial: 'password'
    },
    {
        type: 'text',
        name: 'github_username',
        message: 'What is your github username?'
    }
];
let project_name, github_username = '';

console.log(boxen( chalk.white.bold("Setting up your development environment ..."), boxenOptions ));

(async ()=> {
    const response = await prompts(questions);
    project_name = response['project_name'].replace(/\s/g,'').toLowerCase();
    github_username = response['github_username'];

    createProjectDirectory(response);

    let command = '';
    let parameters = [];
    switch (response['project_type']){
        case 'laravel':
            command = 'laravel';
            parameters.push(['new', `../${project_name}/src`]);
            break;
        case 'statamic':
            command = 'composer';
            parameters.push(['create-project', '--prefer-dist', 'statamic/statamic', `../${project_name}/src`]);
            break;
    }

    // scaffold new application
    const project = spawn(command, ...parameters);
    // once finished copy and clean files
    project.on("close", result => {
        copyGitIgnore();
        updateLaravelEnvFile(response);
        const git = spawn("git", ["init", `../${project_name}`]);
        git.on("close", code => {
            console.log(boxen(chalk.white.bold(`Development environment complete. Please 'cd  ../${project_name}' to get started.`), boxenOptions));
        });
    });
})();

function createProjectDirectory(response){
    let directory = `../${project_name}`;
    if(!fs.existsSync(directory)){
        fs.mkdirSync(directory);
    }

    writeEnvToRoot(response);
    copyTemplateFiles();
    copyTemplateFolders();
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

    fs.copyFileSync('_templates/_.env.example',`../${project_name}/.env.example`, fs.constants.COPYFILE_FICLONE, (error) => {
        if(error){
            throw error;
        }
        console.log(chalk.blue.bold("Copied example env from templates"));
    });
}

function copyGitIgnore(){
    fs.copyFileSync('_templates/_.gitignore', `../${project_name}/src/.gitignore`, fs.constants.COPYFILE_FICLONE, (error) => {
        if (error) {
            throw error;
        }
        console.log(chalk.blue.bold("Copied .gitignore from templates"));
    });
    fs.copyFileSync('_templates/_.gitignore', `../${project_name}/.gitignore`, fs.constants.COPYFILE_FICLONE, (error) => {
        if (error) {
            throw error;
        }
        console.log(chalk.blue.bold("Copied .gitignore from templates"));
    });
}

function copyTemplateFiles(){
    fs.copyFileSync('_templates/_README.md',`../${project_name}/README.md`, fs.constants.COPYFILE_FICLONE, (error) => {
        if(error){
            throw error;
        }
        console.log(chalk.blue.bold("Copied README.md from templates"));
    });
    fs.copyFileSync('_templates/_package.json',`../${project_name}/package.json`, fs.constants.COPYFILE_FICLONE, (error) => {
        if(error){
            throw error;
        }
        console.log(chalk.blue.bold("Copied package.json from templates"));
    });
    fs.copyFileSync('_templates/_.npmrc',`../${project_name}/.npmrc`, fs.constants.COPYFILE_FICLONE, (error) => {
        if(error){
            throw error;
        }
        console.log(chalk.blue.bold("Copied .npmrc from templates"));
    });
    fs.copyFileSync('_templates/_LICENSE',`../${project_name}/LICENSE`, fs.constants.COPYFILE_FICLONE, (error) => {
        if(error){
            throw error;
        }
        console.log(chalk.blue.bold("Copied LICENSE from templates"));
    });
    fs.copyFileSync('_templates/_Dockerfile',`../${project_name}/Dockerfile`, fs.constants.COPYFILE_FICLONE, (error) => {
        if(error){
            throw error;
        }
        console.log(chalk.blue.bold("Copied Dockerfile from templates"));
    });
    fs.copyFileSync('_templates/_docker-compose.yml',`../${project_name}/docker-compose.yml`, fs.constants.COPYFILE_FICLONE, (error) => {
        if(error){
            throw error;
        }
        console.log(chalk.blue.bold("Copied docker-compose.yml from templates"));
    });

    updatePlaceholders(
        `../${project_name}/package.json`,
        `../${project_name}/README.md`,
        );
}

function copyTemplateFolders(){
    fsx.copy('_templates/_nginx', `../${project_name}/nginx`, (err) => {
        if(err){
            throw err;
        }
    })
}

function updatePlaceholders(...files){

    try {
        let changedFile = replace.sync({
            files: files,
            from: [/<PROJECT_NAME>/g, /<GITHUB_USERNAME>/g],
            to: [`${project_name}`, `${github_username}`]
        });
    } catch (error) {
        console.error(chalk.red.bold(`Error updating project name placeholders`));
    }

    console.log(chalk.blue.bold(`package.json updated.`));
}

function updateLaravelEnvFile(response){

    try {
        let changedFile = replace.sync({
            files: `../${project_name}/src/.env`,
            from: [
                'APP_NAME=Laravel',
                'APP_URL=http://localhost',
                'DB_HOST=127.0.0.1',
                'DB_DATABASE=laravel',
                'DB_USERNAME=root',
                'DB_PASSWORD='
            ],
            to: [
                `APP_NAME=${project_name}`,
                `APP_URL=http://localhost:${response['http_port']}`,
                `DB_HOST=mysql`,
                `DB_DATABASE=${response['mysql_database']}`,
                `DB_USERNAME=${response['mysql_user']}`,
                `DB_PASSWORD=${response['mysql_password']}`
            ]
        });
    } catch (error) {
        console.error(chalk.red.bold(`Error updating laravel env`));
    }

    console.log(chalk.blue.bold(`laravel env updated.`));
}
