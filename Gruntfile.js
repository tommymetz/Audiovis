module.exports = function(grunt) {
	const sass = require('sass');
	
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		////////////////////////////////////////////////////
		//SASS//////////////////////////////////////////////
		////////////////////////////////////////////////////
		sass: {
	    options: {
	      implementation: sass,
	      style: 'compressed'  // Modern Sass API uses 'style' instead of deprecated 'outputStyle'
	    },
	    dist: {
	      files: {
	        'public/css/styles.min.css': 'public/css/scss/main.scss'
	      }
	    }
	  },

		////////////////////////////////////////////////////
		//JSHINT////////////////////////////////////////////
		////////////////////////////////////////////////////
		jshint: {
			options: {
	      globals: {
	        THREE: true
	      },
				'-W083': true,
				'browser': true,
				'esversion': 6
	    },
      all: [
        'Gruntfile.js',
        'js/src/*.js',
				'js/src/models/*.js',
				'js/src/colors/*.js'
      ]
    },

		////////////////////////////////////////////////////
		//UGLIFY////////////////////////////////////////////
		////////////////////////////////////////////////////
		uglify: {
				app: {
					options : {
						sourceMap : true,
						sourceMapName : 'public/js/app.min.map'
					},
					src : [
						'public/js/dist/public/js/src/webgl-detector-compiled.js',
						'public/js/dist/public/js/src/scene-compiled.js',
						'public/js/dist/public/js/src/scene_gui-compiled.js',
						'public/js/dist/public/js/src/song-compiled.js',
						'public/js/dist/public/js/src/song_gui-compiled.js',
						'public/js/dist/public/js/src/stem-compiled.js',
						'public/js/dist/public/js/src/models/*-compiled.js',
						'public/js/dist/public/js/src/colors/*-compiled.js'
					],
					dest : 'public/js/app.min.js'
				},
				dep: {
					options : {
						sourceMap : true,
						sourceMapName : 'public/js/dep.min.map'
					},
					src : [
						'public/js/three-bundle.js',
						'public/js/orbit-controls-bundle.js',
						'node_modules/stats.js/build/stats.min.js',
						'node_modules/dat.gui/build/dat.gui.min.js',
						'node_modules/sortablejs/Sortable.min.js'
					],
					dest : 'public/js/dep.min.js'
				}
		},

		////////////////////////////////////////////////////
		//WATCH/////////////////////////////////////////////
		////////////////////////////////////////////////////
		watch: {
			files: [
				'public/css/scss/*',
				'public/js/src/*'
			],
			tasks: ['jshint', 'sass', 'babel', 'uglify:app']
		},

		////////////////////////////////////////////////////
		//BABEL/////////////////////////////////////////////
		////////////////////////////////////////////////////
		babel: {
    	options: {
	      sourceMap: true,
	      presets: ['@babel/preset-env']
	    },
	    dist: {
	      files: [{
            "expand": true,
            "src": [
							'public/js/src/*.js',
							'public/js/src/models/*.js',
							'public/js/src/colors/*.js'
						],
            "dest": "public/js/dist/",
            "ext": "-compiled.js"
        }]
	    }
	  },

	}); //END grunt.initConfig

	//LOAD TASKS
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-babel');

	//REGISTER TASKS
	grunt.registerTask('default', [ 'jshint', 'sass', 'babel', 'uglify:app']);
	grunt.registerTask('dep', [ 'jshint', 'sass', 'babel', 'uglify:dep']);

};
