# <PROJECT_NAME>

A laravel based web application

### Prerequisites

[Docker (mac)](https://docs.docker.com/docker-for-mac/) - needed for application containers used during development

```
$ docker --version
Docker version 18.09, build c97c6d6

$ docker-compose --version
docker-compose version 1.24.0, build 8dd22a9

$ docker-machine --version
docker-machine version 0.16.0, build 9ba6da9
```

### To Start Developing

To start developing on your machine, double check `.env` variables in both root and src folders and start the containers

#### Available Commands
```
// Start docker containers
$ npm run on

// Stop and remove docker containers
$ npm run off

// Remote into the php container
$ npm run remote

// Rebuild any Dockerfile container, useful after Dockerfile changes
$ npm run rebuild

// Run artisan commands on php container
$ npm run artisan -- make:model -h

// Run composer commands on php container
$ npm run composer -- -v
```

To run any other commands on any other container

```
$ docker-compose exec <container_name> <command> <optional:parameters>

// Examples
$ docker-compose exec php composer install
$ docker-compose exec php npm install
$ docker-compose exec php php /var/www/artisan
```

## Built With

* [Laravel](https://laravel.com/docs/) - PHP Framework
* [Composer](https://getcomposer.org/doc/) - Dependency Management
* [Node](https://nodejs.org/en/) - Node w/ Package Manager
* [Docker](https://docs.docker.com/) - Image container 

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Jimmy Aldape** - [https://jimmyaldape.dev](https://jimmyaldape.dev)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
