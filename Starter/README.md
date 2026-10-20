# Звездара Театар

Статички сајт у оквиру Front-end HBS Starter-а. Текст је на ћирилици. Улазнице и званичне странице отварају се на zvezdarateatar.rs.

Потребан је Node.js из `engines` (`>=24.13.0`). У овом фолдеру:

```bash
nvm use
npm install
npm run build-dev
npm run server
```

`npm run server` покреће `reload` на порту 3000 из `../wwwroot`. За развој, у другом терминалу: `npm run watch`.

---

# Front-end HBS Starter v4.6.0

## Version history

<details open>

<summary>4.7.0</summary>
- updated packages(02.04.2026.)
</details>

<summary>4.6.0</summary>
- updated node version
- updated packages(22.01.2026.)
- partials removed
- cookies removed
- skip link fix
</details>


---

### Installation Instructions

Make sure you are on the correct version of Node.js. Required version is noted in the `package.json` under `engines.node`.
Install dependencies by running Node Package Manager. `npm install`

### Tasks

#### `npm run build-dev`

- Builds the project for development purposes
- It will add noindex, nofollow and will **not** optimize css and js files.

#### `npm run build-stage`

- Builds the project for staging purposes
- It will add noindex, nofollow and will opitimize css and js files.

#### `npm run build-prod`

- Builds the project for production purposes
- It will add index, follow, GTM and will optimize css and js files.

#### `npm run watch`

- Turns on watch mode and compiles `.scss`, `.js` and `.hbs` files

#### `npm run cf`

- Creates new files. It should be use to generate new handlebars templates, and modules
- More info about this command can be found [here](#create-files)

#### `npm run assets`

- Copies content of `src/assets` folder to `wwwroot/assets`
- Builds iconfont from `src/assets/svg` folder
    - This command will generate `.woff` and `.woff2` font files
    - Naming convention for the svg files should be `ico-[name].svg`
    - In order to show icons, all you need to do is add class `"icon font-ico-[name]"`
        ```html
        <span class="icon font-ico-heart"></span>
        ```

#### `npm run html-validate`

- Performs validation of HTML files that are generated in the `wwwroot` folder
- Note that only the 'build-dev' and 'watch' tasks generate HTML files

### Create files

#### Create item

Items are used as smaller parts of modules that are repeated throughout the website.

Command: `npm run cf -- -i item-name`

This command will create new module files in `src/html/items` directory:

- .hbs
- .json

And also a file in `src/scss/modules` directory:

- .scss

It will also update `style.scss` file in `src/scss` directory.

If you use `isMultilanguage` global variable, you will need to run `npm run add-lng` to generate missing languange files

#### Create module

Modules are used for static modules that are going to be used and reused throughout the website.

Command: `npm run cf -- -m module-name`

This command will create new module files in `src/html/modules` directory:

- .hbs
- .json

And also a file in `src/scss/modules` directory:

- .scss

It will also update `style.scss` file in `src/scss` directory.

If you use `isMultilanguage` global variable, you will need to run `npm run add-lng` to generate missing languange files

#### Create template

Templates are used for pages, they will be converted in final html files

Command `npm run cf -- -t template-name`

This command will create new template files in `src/html/templates` directory:

- .hbs
- .json

If you use `isMultilanguage` global variable, you will need to run `npm run add-lng` to generate missing languange files

### Usage

#### HBS

##### Modules/Items

All sections, modules, blocks, ... _(accordions, sliders, tabs, banner...)_ should be created as modules in `src/html/modules` and `src/scss/modules` directory.
All items, smaller part of modules, ... _(button, link, card...)_ should be created as items in `src/html/items` and `src/scss/modules` directory.

Each module/item has three files:

- `src/html/(modules/items)` directory:
    - .hbs
    - .json

- `src/scss/modules` directory:
    - .scss

See [Handlebars](https://handlebarsjs.com/) templating engine for more information about `.hbs` files.

##### Templates

Ideally all Templates should be created using _Modules_.

Each template has two files:

- .hbs _(template html templating structure)_
- .json _(template content)_

* Use `bodyCssClass` prop to set the body class for certain template _(`"clasbodyCssClasss": "about"` will add a `about` class to that template)_

* Use `data` prop object to:
* **include** module's `data.json` file:

\*This will compile into an `.html` file in `dist or wwwwroot` directory.

#### CONDITIONS

The `compare` helper can be used where truthy or falsy data values are not enough, but you instead like to compare two data values, or compare something against a static value.

It supports all common operators, like `===`, `!==`, `<`, `<=`, `>`, `>=`, `&&` and `||`.

**Example:**

```handlebars
{{#if (compare v1 "operator" v2)}}
	foo
{{else if (compare v1 "operator" v2)}}
	bar
{{else}}
	baz
{{/if}}
```

Inline (nested) Condition Usage:

```handlebars
{{#if
	(compare (compare v1 "operator" v2) "operator" (compare v1 "operator" v2))
}}
	foo
{{else}}
	bar
{{/if}}
```

The `ifAny` helper can be used to check if multiple data values are added, to avoid printing empty HTML elements.

**Example:**

```handlebars
{{#ifAny elementOne elementTwo elementThree}}
	foo
{{/ifAny}}
```

The `#ifContains` helper can be used to check if data value is equal to provided string or multiple stings

**Example:**

```handlebars
{{#ifContains value stringOne stringTwo}}
	foo
{{/ifContains}}
```

#### SCSS

All styles should be written in `src/scss` directories.
The main SCSS file for RTE formats in CMS must contain the word `rte`in the name, also all other main files must not contain the given word.

CSS code quality is checked with [Sass Lint](https://github.com/sasstools/sass-lint)

#### JavaScript

All scripts should be written in `src/js` directories.
Global files should be written under `global` directory, and imported in global.js (eg. header.js).
Helpers directory is used for files that we are using in another files.
All modules should have their own script files and they are automatically imported into global.js.
**Script name and export const name must be the same**
**Include the script in the corresponding HBS file by adding the data-script attribute with the script name**

Javascript code quality is checked with [ESLint](https://eslint.org/)

---

#### Husky

In the package.json file, within the `prepare` script, it is necessary to modify the paths to reflect the structure of your project.
Following the `cd` command, the path should be written to navigate from the directory containing package.json back to the root folder of the Git repository.
After the `husky` command, specify the full path that leads from the root folder to the .husky folder.
Also, it is necessary to replace `Starter` in the [pre-commit] file to the actual name of the folder where the html folder is located.
Afterwards, execute `npm install`.

---

#### Config file

In this file are some variables that are used for or control the behavior of tasks.
Path: `src\config\config.js`

#### isMultilanguage

If you select this option hbs will get generated into separate folder for all of the languages.
**Important!** use this only if its a static website or an annual report.
To add more languages just updated the `globalVars.languages` array with new language.

#### errorPage

If you select this option (the parameter should be a string, the name of the error page eg. error-404), the web.config file will be generated.

#### Bugs and potential improvements

Please submit any bugs or potential improvements you find to [this](https://docs.google.com/forms/d/e/1FAIpQLSexBpRsgBOSY4HVd_30_FnKcPVq_YHlrAkGYjw5jduWQ3Uw4Q/viewform) Google form

#### Axe-Core Accessibility Linging

While using development mode, please check console for accessibility violations.
By default config for linting is set to A level. If your accessibility requirements are higher, please check config file 'axe-linter.js' and documentation [this link](https://www.deque.com/axe/core-documentation/api-documentation/). For better and more valid results it would be neccesary to use 3rd party tools for accesibility check.
