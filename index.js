#!/usr/bin/env node

const fsx = require("fs-extra");
const { spawn } = require('child_process');
const replace = require('replace-in-file');
const chalk = require("chalk");
const boxen = require("boxen");
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
        message: 'ENV: PROJECT_NAME'
    },
    {
        type: 'text',
        name: 'project_description',
        message: 'ENV: PROJECT_DESCRIPTION',
        initial: 'This is a description'
    },
    {
        type: 'number',
        name: 'http_port',
        message: 'ENV: HTTP_PORT',
        initial: 8000
    },
    {
        type: 'number',
        name: 'mysql_port',
        message: 'ENV: MYSQL_PORT',
        initial: 3306
    },
    {
        type: 'text',
        name: 'mysql_database',
        message: 'ENV: MYSQL_DATABASE',
        initial: 'laraveldb'
    },
    {
        type: 'text',
        name: 'mysql_username',
        message: 'ENV: MYSQL_USERNAME',
        initial: 'dbuser'
    },
    {
        type: 'text',
        name: 'mysql_password',
        message: 'ENV: MYSQL_PASSWORD',
        initial: 'password'
    },
    {
        type: 'text',
        name: 'github_username',
        message: 'What is your github username?',
        initial: 'acme'
    },
    {
        type: 'text',
        name: 'author_name',
        message: "What is the author's name?",
        initial: 'Mr. Robot'
    },
    {
        type: 'text',
        name: 'author_email',
        message: "What is the author's email?",
        initial: 'robot@acme.com'
    },
    {
        type: 'text',
        name: 'author_website',
        message: "What is the author's website?",
        initial: 'www.somewebsite.dev'
    }
];
let project_type,
    project_name,
    project_description,
    http_port,
    mysql_port,
    mysql_database,
    mysql_username,
    mysql_password,
    github_username,
    author_name,
    author_email,
    author_website = '';

console.log(boxen( chalk.white.bold("Setting up your development environment ..."), {
    padding: 2,
    margin: 3,
    borderStyle: "round",
    borderColor: "blue",
} ));

async function init() {
        const answer = await prompts(questions);
        project_type = answer.project_type;
        project_name = answer.project_name.replace(/\s/g,'').toLowerCase();
        project_description = answer.project_description;
        github_username = answer.github_username;
        author_name = answer.author_name;
        author_email = answer.author_email;
        author_website = answer.author_website;
        http_port = answer.http_port;
        mysql_port = answer.mysql_port;
        mysql_database = answer.mysql_database;
        mysql_username = answer.mysql_username;
        mysql_password = answer.mysql_password;
}


function scaffoldNewApplication(){
    console.log(chalk.blue.bold(`Scaffolding ${project_type} project ...`));
    let command = '';
    let parameters = [];
    switch (project_type){
        case 'laravel':
            command = 'laravel';
            parameters.push(['new', `${project_name}`]);
            break;
        case 'statamic':
            command = 'composer';
            parameters.push(['create-project', '--prefer-dist', 'statamic/statamic', `${project_name}`]);
            break;
    }

    // scaffold new application
    const project = spawn(command, ...parameters);
    // once finished copy and clean files
    project.on("exit", result => {
        configureEnvironment();
    });
}
function configureEnvironment(){
    console.log(chalk.blue.bold("Creating a new git directory ..."));
    let directory = `../${project_name}`;
    // create directory if needed
    fsx.ensureDir(directory)
        .then(()=>{ moveNewApplication(); })
        .catch( err => { console.log(err); });
}
function moveNewApplication(){
    console.log(chalk.blue.bold(`Moving the ${project_name} project into the new git directory ...`));
    fsx.move(`${project_name}`, `../${project_name}/src`)
        .then( () => { copyTemplateFiles(); })
        .catch( err => { console.log(err); });
}
function copyTemplateFiles() {
    console.log(chalk.blue.bold("Copying template files ..."));

    const directory = '_templates/';

    fsx.readdir(directory, (err, files) => {
        if(err) throw err;

        files.forEach(file => {
            fsx.copy(`${directory}/${file}`, `../${project_name}/${file.replace('_','')}`, err => {
                if (err) throw err;
            });
        });

        fsx.copy(`${directory}/_.env.example`,`../${project_name}/.env`)
            .then(() => { copyMiscFiles(); })
            .catch( err => { console.log(err); });
    });
}
function copyMiscFiles(){
    console.log(chalk.blue.bold("Updating misc files ..."));
    fsx.copy(`../${project_name}/.gitignore`, `../${project_name}/src/.gitignore`)
        .then(() => {  })
        .catch( err => { console.log(err); });

    fsx.move(`../${project_name}/.php_cs`, `../${project_name}/src/.php_cs`)
        .then( () => { updateRootEnv(); })
        .catch( err => { console.log(err); });
}
function updateRootEnv(){
    console.log(chalk.blue.bold("Updating root project environment files ..."));
    let projectEnv = updatePlaceholders(
        [
            /{PROJECT_NAME}/g,
            /{PROJECT_DESCRIPTION}/g,
            /{GITHUB_USERNAME}/g,
            /{AUTHOR_NAME}/g,
            /{AUTHOR_EMAIL}/g,
            /{AUTHOR_WEBSITE}/g,
            /{HTTP_PORT}/g,
            /{MYSQL_PORT}/g,
            /{MYSQL_PASSWORD}/g,
            /{MYSQL_USERNAME}/g,
            /{MYSQL_DATABASE}/g,
        ],
        [
            project_name,
            project_description,
            github_username,
            author_name,
            author_email,
            author_website,
            http_port,
            mysql_port,
            mysql_password,
            mysql_username,
            mysql_database
        ],
        `../${project_name}/README.md`,
        `../${project_name}/LICENSE`,
        `../${project_name}/.env`,
        `../${project_name}/package.json`
    );
    projectEnv.then(() => { updateLaravelEnv(); });
    // projectEnv.then(() => { gitInit(); });
}

function updateLaravelEnv(){
    console.log(chalk.blue.bold(`Updating ${project_type} environment files ...`));
    let laravelEnv = updatePlaceholders(
        [
            /Laravel/g,
            `APP_URL=http://${project_name}.test`,
            /DB_HOST=127.0.0.1/g,
            `DB_DATABASE=${project_name}`,
            /root/g,
            /DB_PASSWORD=/g,
        ],
        [
            project_name,
            `APP_URL=http://localhost:${http_port}`,
            'DB_HOST=mysql',
            `DB_DATABASE=${mysql_database}`,
            mysql_username,
            `DB_PASSWORD=${mysql_password}`,
        ],
        `../${project_name}/src/.env`,

    );
    laravelEnv.then(()=>{ gitInit(); });
}

function gitInit(){
    console.log(chalk.blue.bold("Initializing git directory ..."));
    const git = spawn("git", ["init", `../${project_name}`]);
    git.on("exit", code => {
        console.log(boxen(chalk.white.bold(`Project is ready for development. Please type 'cd  ../${project_name}' to get started.`), {
            padding: 2,
            margin: 3,
            borderStyle: "round",
            borderColor: "blue",
        }));
    });

}
async function updatePlaceholders(words, replacements,...files ){

    try{
        words.forEach((word, i) => {
            let changedFiles = replace.sync({
                files: files,
                from: word,
                to: replacements[i]
            });
            // console.log(`Modified files - ${i}:`, changedFiles.join(', '));
        });

    } catch (error) {
        console.error('Error occurred: ', error);
    }

}

init().then(()=> {
    scaffoldNewApplication()
})
