# PR Podcast website

This is the repo for generating PR podcast website.
In essence, this is a __simple static site generator with no dependencies__.

## Run
- Use `nvm` to make sure you have the right version: `nvm use`
- Run `npm install` to install Typescript and Node Types
- Build the project:
    - `./build.sh` to generate the website in `docs` directory
    - `./build.sh test` to run the tests
    - `./build.sh serve` build and serve the website

## Structure
All the contents for the website are int `site` directory:
- `content`: Markdown files for posts
- `static`: Static files, which can have templates (TODO: Rename)
- `layout`: Layouts that can be used in posts
- `include`: Partial HTML files that can be included in other HTML files

## Templates
We have our own template engine. Rules are simple:
- You can write JS code in lines starting with `%`: `% let name = 5`
- Literal templates (`${}`) are evaluated as JS values: `<p> Hello ${ name }</p>`
- Special commands:
    - `% include` will add the HTML file from `include` directory.

### Variables
- In every page you have access to all the values defined `config.json` file: `${ site.title }`

#### Pages
All the files in static directory are pages. They have access to:
- `posts`: List containing all the posts data

#### Posts
Posts are in `site/content` directory and their file name should in this format: `YYYY-MM-DD-title.md`. Every post has access to:
- `post`: Collection of the post data defined in FrontMatter
- `content`: Post content
- `url`: Post relative URL from base URL
- `publishDate`: Post publish date, from file name

## Issues
- Why the `docs` directory is included in the repo?
I tried to build the `docs` on CloudFlare and then serve the directory. For some reason it didn't work (Couldn't find the pages). I also tried the same thing on Netlify and again, the same problem.

## TODO
- [ ] Add Markdown support for posts
- [X] All data defined in Front-Matter should be accessible in the template
- [ ] Make transformations faster
- [ ] Parse lists in Front-Matter
- [X] Install `serve` locally
- [ ] Remove `.posts_cache.json` from root directory
