### frontend-version-package
----------------------------

#### description
The gulp workflow to package frontend resources, adding hash stamp to `link` and `script` tag for `html` files in order to solve the cache problem of infinity project.

#### command
* `npm run gulp-build`  
just start the gulp build task.
* `bash gulp-build.sh path/to/infinity-frontend/infinity.boreas`  
get the newest project files(html/css/js) from infinity-frontend git repository and run `npm run gulp-build`

#### preview
```html
<link rel="stylesheet" href="../css/index.css?v=6a9f2bbb72">
<script type="text/javascript" src="../js/index.js?v=3e2a94e455"></script>
```

#### attention
the follow modules in `node_modules` dir must not be reinstall. I rewrite part of the code of them, if you remove `node_modules` dir in accident, there's a bakup called `node_modules.tar.gz` in root directory, just unpack it.
* gulp-rev
* gulp-rev-collector
* rev-path
