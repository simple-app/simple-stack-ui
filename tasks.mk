
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
COMP_FILTER	  = $(SIMPLE_STACK)/node_modules/component-filter

DIRS  = $(shell find $(SIMPLE_STACK)/files -type d -name '*[a-zA-Z]' | sed 's:^$(SIMPLE_STACK)/files/::')
FILES = $(shell find $(SIMPLE_STACK)/files -type f                   | sed 's:^$(SIMPLE_STACK)/files/::')

define COMPONENT_BUILD_CSS
$(SIMPLE_STACK_BIN)/component build --use $(COMP_FILTER)/scripts,$(COMP_FILTER)/json,$(COMP_FILTER)/templates,$(SIMPLE_STACK)/node_modules/component-stylus --name style
# TODO figure out how to get rid of this script file
rm -f build/style.js
endef

define COMPONENT_BUILD_JS_APP
$(SIMPLE_STACK_BIN)/component build --copy --no-require --use $(SIMPLE_STACK)/lib/nghtml,$(COMP_FILTER)/vendor,$(COMP_FILTER)/styles --name app
endef

define COMPONENT_BUILD_JS_VENDOR
$(SIMPLE_STACK_BIN)/component build --copy --no-require --use $(SIMPLE_STACK)/lib/nghtml,$(COMP_FILTER)/app,$(COMP_FILTER)/styles --name vendor
endef

define COMPONENT_BUILD_JS_REQUIRE
mkdir -p build
cp $(SIMPLE_STACK)/node_modules/component-require/lib/require.js build/require.js
endef

build   : install lint build/require.js build/app.js build/style.css build/vendor.js
prod    : build build/require.js build/app.min.js build/style.min.css build/vendor.min.js manifest.json
install : node_modules components

node_modules: package.json
	@npm install

components: component.json
	@$(SIMPLE_STACK_BIN)/component install

build/require.js:
	@$(call COMPONENT_BUILD_JS_REQUIRE)

build/require.min.js: build/require.js
	@$(SIMPLE_STACK_BIN)/uglifyjs --compress --mangle -o $@ $<

build/app.js: $(JS_FILES) $(PARTIAL_FILES) component.json
	@$(call COMPONENT_BUILD_JS_APP)

build/app.min.js: build/app.js
	@$(SIMPLE_STACK_BIN)/uglifyjs --compress --mangle -o $@ $<

build/vendor.js: component.json
	@$(call COMPONENT_BUILD_JS_VENDOR)

build/vendor.min.js: build/vendor.js
	@$(SIMPLE_STACK_BIN)/uglifyjs --compress --mangle -o $@ $<

build/style.css: $(CSS_FILES) $(STYL_FILES) component.json
	@$(call COMPONENT_BUILD_CSS)

build/style.min.css: build/style.css
	@$(SIMPLE_STACK_BIN)/cleancss --remove-empty --s0 --skip-import --output $@ $<

lint: $(JS_FILES)
	@$(SIMPLE_STACK_BIN)/jshint app.js public/javascripts/*

manifest.json: $(wildcard build/*)
	@$(SIMPLE_STACK_BIN)/simple-assets --glob 'build/**/!(cache-)*' --copy --prefix cache-

clean:
	rm -fr build components manifest.json

### Init files
init    : $(DIRS) $(FILES) install

$(DIRS):
	@mkdir -p $@

$(FILES):
	@awk '{gsub(/PROJECT/, "$(PROJECT)"); gsub(/DESCRIPTION/, "$(DESCRIPTION)"); gsub(/REPO/, "$(REPO)");print}' \
		$(SIMPLE_STACK)/files/$@ > $@

.PHONY: clean build prod init install lint
