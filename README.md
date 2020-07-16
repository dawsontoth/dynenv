# DynEnv

Dynamically loads environment variables from modules and then spawns a child process with them

It's like  [dotenv](https://github.com/motdotla/dotenv), but instead of .env files, you require modules!

## Usage

Add `dynenv` as a dev dependency using your particular package manager:
```json
npm install dynenv --save-dev
yarn add dynenv --dev
```

Say you had a file, `snippet.js`, with the following:

```javascript
module.exports = function() {
  return {
    REACT_APP_SAY_WHAAAAAT: 'WORLD!',
  };
};
```

... and a [react](https://github.com/facebook/react) app. You know how to use environment variables in your app, right?

```html
<title>Hello %REACT_APP_SAY_WHAAAAAT%!</title>
```

Now put everything together in your `package.json` by invoking `dynenv`!

```
  "scripts": {
    "start": "dynenv ./snippet.js -- react-scripts start",
```

Everything before the `--` will be one-by-one required and given the opportunity to augment the environment. Then, whatever comes after
will be spawned with the newly populated environment variables!

### Usage in Third Party Modules

If you are crafting a module that can inject environment variables through dynenv, instead of forcing clients to reference a particular file in their call to `dynenv`, you can modify your package.json to point at that file. dynenv will find and invoke your script automatically.

```
{
  ...
  "dynenv": "build/cli/index.js",
  ...
}
```
