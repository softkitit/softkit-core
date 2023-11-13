# This resource plugin has generators for convenient development of new resources and their CRUD operations 

### Install

```bash
yarn add @softkit/resource-plugin
```

### Available generators 

- `resource` - generates a new resource with CRUD operations
- `service` - generates a new service for a resource
- `controller` - generates a new controller for a resource
- `app` - generates a new app for a resource
- `http-client` - generates a new http client for an app
- `i18n` - adding support for i18n, creates a new folder with translations and adds it to the config
- `lib` - generates a new lib for a resource, can add i18n and config

### Usage

[//]: # todo document base usage of generators


### Development 

#### Add new generator

```bash
nx generate @nx/plugin:generator ${GENERATOR_NAME} --project=resource-plugin
```

#### Test generator

```bash
nx generate @softkit/resource-plugin ${GENERATOR_NAME} --project=resource-plugin
```
