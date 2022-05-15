# PR Podcast website

- Run `npm install` to install Typescript and Node Types
- Build the project:
    - `./build.sh` to generatethe website in `dist` directory
    - `./build.sh test` to run the tests
    - `./build.sh serve` build and serve the website

## Templates
We have our own template engine. Rules are simple:
- You can write JS code in lines starting with `%`: `% let name = 5`
- Literal templates (`${}`) are evaluated as JS values: `<p> Hello ${ name }</p>`
- Beside the values you define in a file, You have access to:
    - Everything in `config.json` file: `${ site.title }`
    - `posts`: List containing all the posts data
    - Each post, defined in `site/content`, has access to:
        - `content`: Post content
        - `post`: Collection of the post data defined in FrontMatter
- Speciall commands:
    - `% include` will add the HTML file from `include` directory.
- Everything else is copied unchanged.

