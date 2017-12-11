# demo-portal
A demo portal created using various technologies

| Name | Description |
| ------ | ------ |
| Bootstrap | A responsive page that uses the bootstrap classes. |
|  | Add/update/delete tasks and view the status of the tasks in the charts shown in the page. |
|  | It uses CakePHP API and returns JSON which contains list of tasks. |
| AngularJS |A responsive page that uses angularjs platform. |
|  | Add/update/delete tasks and view the status of the tasks in the charts shown in the page. |
|  | It uses CakePHP API and returns JSON which contains list of tasks. |
| Google Maps (Movies and Restaurants locators) | Search for nearest movies/restaurants around your location.|
|  | This page uses HTML 5 Location API. |
| Responsive Sidebar | A reusable sidebar component designed using Bootstrap 4.|
| VueJS |A responsive page that uses Vuejs platform. |
|  | Add/update/delete tasks and view the status of the tasks in the charts shown in the page. |
|  | It uses CakePHP API and returns JSON which contains list of tasks. |


## Getting started

To get you started you can simply clone the repository and install the dependencies:

```js
npm install
```

## Start-up modes
##### 1.Production

```js
npm start
```
`npm start` will go install the necessary modules in all the submodules and it will run the production task which will minify all the files.

## Directory Layout

1. Client side plugins will be managed using bower.
2. Non-AngularJS based files are kept under `{project-folder}/js`
3. Images will go under `{project-folder}/img`
4. CSS will be written using LESS and is initially kept in `{project-folder}/css` but after processing, gets stored in `{project-folder}/dist/css` which is where they are loaded from.
5. Each project folder should have a ` Gruntfile.js` and it should have a `prod` task.
6. Parent folder should have a `Gruntfile.js` which will run the  `prod` tasks in all its subfolders.

```
├── Gruntfile.js
├── node_modules
├── package.json
├── README.md
├── project1
│   ├── css
│   │   └── empty
│   ├── img
│   │   └── empty
│   ├── js
│   │   └── empty
│   ├── Gruntfile.js
│   ├── index.html
│   ├── package.json
│   ├── bower.json
│   ├── .bowerrc
│   ├── README.md
├── project2
│   ├── css
│   │   └── empty
│   ├── img
│   │   └── empty
│   ├── js
│   │   └── empty
│   ├── Gruntfile.js
│   ├── index.html
│   ├── package.json
│   ├── bower.json
│   ├── .bowerrc
│   ├── README.md
```
