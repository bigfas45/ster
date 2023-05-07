// This file delete the dist file because we deactivated the deleteOutputPath of angular
// in other to accommodate multiple language build in one folder. However, we need to ensure
// that all files generated in the dist file are new files hence the necessity of this file (remove-dist.js)
// This file is called from the package.json script

const fs = require('fs')

fs.rm('dist', { recursive: true },  (err) => {})
