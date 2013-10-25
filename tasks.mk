
PROJECT      ?= $(notdir $(CURDIR))
DESCRIPTION  ?= A simple app
ORGANIZATION ?= $(PROJECT)
REPO         ?= $(ORGANIZATION)/$(PROJECT)

JS_FILES      = $(shell find public -type f -name '*.js')
CSS_FILES     = $(shell find public -type f -name '*.css')
STYL_FILES    = $(shell find public -type f -name '*.styl')
PARTIAL_FILES = $(shell find public -type f -name '*.jade')

SIMPLE_STACK      = $(CURDIR)/node_modules/simple-stack-ui
SIMPLE_STACK_BIN  = $(SIMPLE_STACK)/node_modules/.bin

DIRS  = $(shell find $(SIMPLE_STACK)/files -type d -name '*[a-zA-Z]' | sed 's/\.\///')
FILES = $(shell find $(SIMPLE_STACK)/files -type f                   | sed 's/\.\///')

define COMPONENT_BUILD
$(SIMPLE_STACK_BIN)/component build --copy --use $(SIMPLE_STACK)/lib/nghtml,$(SIMPLE_STACK)/node_modules/component-stylus --standalone $(PROJECT)
endef

prod    : build build/build.min.js build/build.min.css manifest.json
build   : install lint build/build.js build/build.css
install : node_modules components
init    : $(DIRS) $(FILES) install

$(DIRS):
	@mkdir -p $@

$(FILES):
	@awk '{gsub(/PROJECT/, "$(PROJECT)"); gsub(/DESCRIPTION/, "$(DESCRIPTION)"); gsub(/REPO/, "$(REPO)");print}' \
		./node_modules/simple-stack-ui/files/$@ > $@

node_modules: package.json
	@npm install

components: component.json
	@$(SIMPLE_STACK_BIN)/component install

build/build.js: $(JS_FILES) $(PARTIAL_FILES)
	@$(call COMPONENT_BUILD)

build/build.min.js: build/build.js
	@$(SIMPLE_STACK_BIN)/uglifyjs --compress --mangle -o $@ $<

build/build.css: $(CSS_FILES) $(STYL_FILES)
	@$(call COMPONENT_BUILD)

build/build.min.css: build/build.css
	@$(SIMPLE_STACK_BIN)/cleancss --remove-empty --s0 --skip-import --output $@ $<

lint: $(JS_FILES)
	@$(SIMPLE_STACK_BIN)/jshint public/javascripts/*

manifest.json: $(wildcard build/*)
	@$(SIMPLE_STACK_BIN)/simple-assets --glob 'build/**/!(cache-)*' --copy --prefix cache-

clean:
	rm -fr build components manifest.json

.PHONY: clean build prod init install lint
