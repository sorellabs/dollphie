bin = $(shell npm bin)
ometa = $(bin)/ometajs2js

# -- CONFIGURATION -----------------------------------------------------
LIB_DIR = lib
SRC_DIR = src
SRC = $(wildcard $(SRC_DIR)/*.ometajs)
TGT = ${SRC:$(SRC_DIR)/%.ometajs=$(LIB_DIR)/%.js}


# -- COMPILATION -------------------------------------------------------
$(LIB_DIR)/%.js: $(SRC_DIR)/%.ometajs
	mkdir -p $(dir $@)
	$(ometa) --beautify < $< > $@


# -- TASKS -------------------------------------------------------------
compile: $(TGT)
