module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		////////////////////////////////////////////////////
		//SASS//////////////////////////////////////////////
		////////////////////////////////////////////////////
		sass: {
	    dist: {
	      options: {
	        style: 'compact'
	      },
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
				'browser': true
	    },
      all: [
        'Gruntfile.js',
        'js/src/*.js',
				'js/src/models/*.js'
      ]
    },

		////////////////////////////////////////////////////
		//UGLIFY////////////////////////////////////////////
		////////////////////////////////////////////////////
		uglify: {
		  	dist: {
					files: {
			  		'public/js/<%= pkg.name %>.min.js': [
							'node_modules/three/build/three.js',
							'node_modules/three/examples/js/Detector.js',
							'node_modules/three/examples/js/controls/OrbitControls.js',
							'node_modules/stats.js/build/stats.min.js',
							'node_modules/dat.gui/build/dat.gui.min.js',
							//'public/js/src/*.js',
							//'public/js/src/models/*.js'
						]
					},
		  	},
    },

		////////////////////////////////////////////////////
		//WATCH/////////////////////////////////////////////
		////////////////////////////////////////////////////
		watch: {
			files: [
				'public/css/scss/*',
				'public/js/src/*'
			],
			tasks: ['jshint','sass']
		},

	}); //END grunt.initConfig

	//LOAD TASKS
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	//REGISTER TASKS
	grunt.registerTask('default', [ 'jshint', 'uglify', 'sass']);

};
