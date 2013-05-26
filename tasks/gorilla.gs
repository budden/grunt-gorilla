/*!
 * grunt-gorilla
 * https://github.com/ckknight/grunt-gorilla
 *
 * Copyright (c) 2013 Cameron Kenneth Knight
 * Licensed under the MIT license.
 */

require! path

module.exports := #(grunt)
  grunt.register-multi-task "gorilla", "Compile GorillaScript files into JavaScript.", #!
    let options = @options {
      -bare
      source-map: null
      grunt.util.linefeed
    }
    
    grunt.verbose.writeflags options, "Options"
    
    for file in @files
      let valid-files = remove-invalid-files file
      unless has-expected-extensions valid-files
        continue
      
      compile valid-files, options, file.dest
  
  let remove-invalid-files(files)
    for filter filepath in files.src
      unless grunt.file.exists filepath
        grunt.log.warn "Source file '$filepath' not found."
        false
      else
        true
  
  let compile(files, options, dest)
    let paths = create-output-paths dest
    let dest-dir = path.dirname dest
    try
      require('gorillascript').compile-file-sync {} <<< options <<< {
        input: files
        output: dest
        source-map: if options.source-map
          {
            file: path.join dest-dir, "$(path.basename dest, path.extname dest).js.map"
            source-root: options.source-root or ""
          }
        else
          null
      }
    catch e
      if not e? or not e.line? or not e.column?
        grunt.log.error "Got an unexpected exception from the gorillascript compiler. The original exception was: $(String(e?.stack or e))"
      else
        grunt.log.error e
      grunt.fail.warn "GorillaScript failed to compile."
  
  let has-expected-extensions(files)
    let bad-extensions = []
    for file in files
      let ext = path.extname file
      if ext != ".gs" and ext not in bad-extensions
        bad-extensions.push ext
    
    if bad-extensions.length
      grunt.fail.warn "Expected to only work with .gs files (found $(extensions.join ', '))."
      false
    else
      true