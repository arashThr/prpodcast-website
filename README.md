# PR Podcast website

- Run `npm install` to install Typescript and Node Types
- Build the project:
    - `./build.sh` to generatethe website in `dist` directory
    - `./build.sh test` to run the tests
    - `./build.sh serve` build and serve the website

## Template
We have our own template engine. Rules are simple:
- Lines started with `%` are JavaScript codes which have access to data in `data` directory.
- Lines started with `%= include` will add the HTML file from `include` directory.
- Literal templates (`${}`) are evaluated.
- Everything else is copied unchanged.

## TODO
- [ ] Switch `%- include` to `% include`
- [ ] Remove data directory

